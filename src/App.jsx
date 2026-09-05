import React, { useState, useEffect } from 'react';
import { HRProvider, useHR } from './context/HRContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import BottomNav from './components/common/BottomNav';
import AdminDashboard from './components/admin/AdminDashboard';
import PendingApprovals from './components/admin/PendingApprovals';
import PayrollCalculator from './components/admin/PayrollCalculator';
import EmployeesManager from './components/admin/EmployeesManager';
import EmployeeMasterFile from './components/admin/EmployeeMasterFile';
import ReportsView from './components/reports/ReportsView';
import SettingsManager from './components/settings/SettingsManager';
import EmployeeHome from './components/employee/EmployeeHome';
import EmployeeRequests from './components/employee/EmployeeRequests';
import EmployeePayslips from './components/employee/EmployeePayslips';
import EmployeeProfile from './components/employee/EmployeeProfile';
import RequestModal from './components/employee/RequestModal';
import PayslipModal from './components/common/PayslipModal';
import InstallModal from './components/common/InstallModal';
import LockScreen from './components/common/LockScreen';
import DataManagementModal from './components/admin/DataManagementModal';

function MainApp() {
  const { currentUser, isAppLocked, lockApp } = useHR();

  const [activeTab, setActiveTab] = useState(() => 
    currentUser.role === 'admin' ? 'dashboard' : 'employee-home'
  );

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestModalType, setRequestModalType] = useState('leave');
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState(null);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [dataModalOpen, setDataModalOpen] = useState(false);

  useEffect(() => {
    const handleLock = () => lockApp();
    window.addEventListener('lock-app', handleLock);
    return () => window.removeEventListener('lock-app', handleLock);
  }, [lockApp]);

  useEffect(() => {
    if (currentUser.role === 'admin') {
      if (activeTab.startsWith('employee-')) setActiveTab('dashboard');
    } else {
      if (!activeTab.startsWith('employee-')) setActiveTab('employee-home');
    }
  }, [currentUser.role]);

  const handleOpenNewRequest = (type = 'leave') => {
    setRequestModalType(type);
    setRequestModalOpen(true);
  };

  if (isAppLocked) {
    return <LockScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0F172A] flex flex-col text-slate-900 dark:text-[#F1F5F9] font-sans antialiased selection:bg-orange-500 selection:text-white" dir="rtl">
      
      <Navbar onOpenInstallModal={() => setInstallModalOpen(true)} onOpenDataModal={() => setDataModalOpen(true)} />

      <div className="flex-1 flex w-full overflow-hidden">
        
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-y-auto h-[calc(100vh-3.5rem)]">
          
          {currentUser.role === 'admin' && (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboard 
                  setActiveTab={setActiveTab} 
                  onSelectPayslip={(item) => setSelectedPayslipEmp(item)} 
                />
              )}
              {activeTab === 'approvals' && <PendingApprovals />}
              {activeTab === 'payroll' && (
                <PayrollCalculator 
                  onSelectPayslip={(item) => setSelectedPayslipEmp(item)} 
                />
              )}
              {activeTab === 'employees' && <EmployeesManager />}
              {activeTab === 'employee-file' && (
                <EmployeeMasterFile
                  onSelectPayslip={(item) => setSelectedPayslipEmp(item)}
                />
              )}
              {activeTab === 'reports' && <ReportsView />}
              {activeTab === 'settings' && <SettingsManager />}
            </>
          )}

          {currentUser.role === 'employee' && (
            <>
              {activeTab === 'employee-home' && (
                <EmployeeHome 
                  onOpenNewRequest={handleOpenNewRequest} 
                  setActiveTab={setActiveTab} 
                  setSelectedPayslipEmp={setSelectedPayslipEmp}
                />
              )}
              {activeTab === 'employee-requests' && (
                <EmployeeRequests onOpenNewRequest={handleOpenNewRequest} />
              )}
              {activeTab === 'employee-payslips' && (
                <EmployeePayslips onSelectPayslip={(item) => setSelectedPayslipEmp(item)} />
              )}
              {activeTab === 'employee-profile' && <EmployeeProfile />}
            </>
          )}

        </main>

      </div>

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenNewRequest={() => handleOpenNewRequest('leave')}
      />

      <RequestModal 
        isOpen={requestModalOpen} 
        onClose={() => setRequestModalOpen(false)} 
        initialType={requestModalType}
      />

      <PayslipModal 
        employeeSalary={selectedPayslipEmp} 
        onClose={() => setSelectedPayslipEmp(null)} 
      />

      <InstallModal 
        isOpen={installModalOpen} 
        onClose={() => setInstallModalOpen(false)} 
      />

      <DataManagementModal 
        isOpen={dataModalOpen} 
        onClose={() => setDataModalOpen(false)} 
      />

    </div>
  );
}

export default function App() {
  return (
    <HRProvider>
      <MainApp />
    </HRProvider>
  );
}
