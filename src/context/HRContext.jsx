import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_SETTINGS, calculateEmployeeSalary } from '../utils/egyptianLaborLaw';
import { INITIAL_EMPLOYEES, INITIAL_EFFECTS, DEMO_EMPLOYEES, DEMO_EFFECTS } from '../utils/initialData';
import { dbSet, migrateFromLocalStorage, loadAllFromDB, clearAllDB, checkAndResetDB } from '../utils/storage';

const HRContext = createContext();

export function HRProvider({ children }) {
  const [loaded, setLoaded] = useState(false);

  const [currentUser, setCurrentUser] = useState({ role: 'admin', employeeId: null, name: 'مدير النظام' });
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES.map(emp => ({ ...emp, password: emp.password || '1234' })));
  const [effects, setEffects] = useState(INITIAL_EFFECTS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [activePeriod, setActivePeriod] = useState(currentMonth);

  const [adminPassword, setAdminPassword] = useState('admin123');

  const [isAppLocked, setIsAppLocked] = useState(false);

  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem('egy_hr_theme') || 'light'; } catch { return 'light'; }
  });

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await migrateFromLocalStorage();
      await checkAndResetDB();
      const data = await loadAllFromDB();
      if (cancelled) return;

      if (data.egy_hr_currentUser) {
        try { setCurrentUser(JSON.parse(data.egy_hr_currentUser)); } catch {}
      }
      if (data.egy_hr_employees) {
        try {
          const parsed = JSON.parse(data.egy_hr_employees);
          setEmployees(parsed.map(emp => ({ ...emp, password: emp.password || '1234' })));
        } catch {}
      }
      if (data.egy_hr_effects) {
        try { setEffects(JSON.parse(data.egy_hr_effects)); } catch {}
      }
      if (data.egy_hr_settings) {
        try {
          const parsed = JSON.parse(data.egy_hr_settings);
          setSettings(parsed);
        } catch {}
      }
      if (data.egy_hr_adminPassword) {
        setAdminPassword(data.egy_hr_adminPassword);
      }
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { if (loaded) dbSet('egy_hr_currentUser', JSON.stringify(currentUser)); }, [currentUser, loaded]);
  useEffect(() => { if (loaded) dbSet('egy_hr_employees', JSON.stringify(employees)); }, [employees, loaded]);
  useEffect(() => { if (loaded) dbSet('egy_hr_effects', JSON.stringify(effects)); }, [effects, loaded]);
  useEffect(() => { if (loaded) dbSet('egy_hr_settings', JSON.stringify(settings)); }, [settings, loaded]);
  useEffect(() => { if (loaded) dbSet('egy_hr_adminPassword', adminPassword); }, [adminPassword, loaded]);

  useEffect(() => {
    try { localStorage.setItem('egy_hr_theme', theme); } catch {}
    if (loaded) dbSet('egy_hr_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, loaded]);

  const verifyAdminPassword = useCallback((password) => {
    return password === adminPassword;
  }, [adminPassword]);

  const verifyEmployeePassword = useCallback((empId, password) => {
    const emp = employees.find(e => e.id === empId);
    return emp && emp.password === password;
  }, [employees]);

  const updateAdminPassword = useCallback((newPassword) => {
    setAdminPassword(newPassword);
  }, []);

  const updateEmployeePassword = useCallback((empId, newPassword) => {
    setEmployees(prev => prev.map(emp =>
      emp.id === empId ? { ...emp, password: newPassword } : emp
    ));
  }, []);

  const lockApp = useCallback(() => setIsAppLocked(true), []);
  const unlockApp = useCallback(() => setIsAppLocked(false), []);

  const switchUser = useCallback((role, employeeId = null) => {
    if (role === 'admin') {
      setCurrentUser({ role: 'admin', employeeId: 'EMP-102', name: 'إدارة الموارد البشرية (المدير)' });
    } else {
      const emp = employees.find(e => e.id === employeeId) || employees[0];
      if (emp) {
        setCurrentUser({ role: 'employee', employeeId: emp.id, name: emp.name });
      }
    }
  }, [employees]);

  const addEmployee = useCallback((newEmp) => {
    const nextNum = 100 + employees.length + 1;
    const empId = 'EMP-' + nextNum;
    const employeeWithId = {
      ...newEmp,
      id: empId,
      password: newEmp.password || '1234',
      annualLeaveBalance: Number(newEmp.annualLeaveBalance) || 21,
      casualLeaveBalance: Number(newEmp.casualLeaveBalance) || 6
    };
    setEmployees(prev => [employeeWithId, ...prev]);
    return employeeWithId;
  }, [employees]);

  const updateEmployee = useCallback((id, updatedFields) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updatedFields } : emp));
  }, []);

  const deleteEmployee = useCallback((id) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    setEffects(prev => prev.filter(eff => eff.employeeId !== id));
  }, []);

  const addEffect = useCallback((effectData) => {
    const nextReqNum = 1000 + effects.length + 1;
    const newId = 'REQ-' + nextReqNum;
    const emp = employees.find(e => e.id === effectData.employeeId);
    const newEffect = {
      id: newId,
      employeeName: emp ? emp.name : 'غير محدد',
      requestDate: new Date().toISOString().split('T')[0],
      status: currentUser.role === 'admin' ? 'approved' : 'pending',
      ...effectData
    };
    setEffects(prev => [newEffect, ...prev]);
    return newEffect;
  }, [effects, employees, currentUser.role]);

  const updateEffectStatus = useCallback((effectId, newStatus, adminNotes = '') => {
    setEffects(prev => prev.map(eff => {
      if (eff.id === effectId) {
        if (newStatus === 'approved' && eff.type === 'leave' && eff.status !== 'approved') {
          const emp = employees.find(e => e.id === eff.employeeId);
          if (emp) {
            if (eff.leaveType === 'casual') {
              updateEmployee(emp.id, { casualLeaveBalance: Math.max(0, emp.casualLeaveBalance - (Number(eff.units) || 1)) });
            } else {
              updateEmployee(emp.id, { annualLeaveBalance: Math.max(0, emp.annualLeaveBalance - (Number(eff.units) || 1)) });
            }
          }
        }
        return { ...eff, status: newStatus, adminNotes };
      }
      return eff;
    }));
  }, [employees, updateEmployee]);

  const deleteEffect = useCallback((effectId) => {
    setEffects(prev => prev.filter(eff => eff.id !== effectId));
  }, []);

  const factoryReset = useCallback(() => {
    setEmployees([]);
    setEffects([]);
    setSettings(DEFAULT_SETTINGS);
    setAdminPassword('admin123');
    clearAllDB();
    localStorage.removeItem('egy_hr_currentUser');
    setCurrentUser({ role: 'admin', employeeId: 'EMP-102', name: 'إدارة الموارد البشرية (المدير)' });
  }, []);

  const clearAllEffects = useCallback(() => {
    setEffects([]);
  }, []);

  const clearAllEmployees = useCallback(() => {
    setEmployees([]);
    setEffects([]);
  }, []);

  const loadDemoData = useCallback(() => {
    setEmployees(DEMO_EMPLOYEES.map(emp => ({ ...emp, password: emp.password || '1234' })));
    setEffects(DEMO_EFFECTS);
    setSettings(DEFAULT_SETTINGS);
    setAdminPassword('admin123');
    setCurrentUser({ role: 'admin', employeeId: null, name: 'مدير النظام' });
  }, []);

  const restoreFullBackup = useCallback((data) => {
    if (data.employees) setEmployees(data.employees);
    if (data.effects) setEffects(data.effects);
    if (data.settings) setSettings(data.settings);
    if (data.adminPassword) setAdminPassword(data.adminPassword);
    if (data.employees && data.employees.length > 0) {
      setCurrentUser({ role: 'admin', employeeId: 'EMP-102', name: 'إدارة الموارد البشرية (المدير)' });
    }
  }, []);

  const resetToDemoData = useCallback(() => {
    loadDemoData();
    clearAllDB();
    localStorage.clear();
  }, [loadDemoData]);

  const calculatePayrollForPeriod = useCallback((period = activePeriod) => {
    return employees.map(emp => {
      const empApprovedEffects = effects.filter(eff =>
        eff.employeeId === emp.id && eff.status === 'approved'
      );

      const overtimeHours = { day: 0, night: 0, holiday: 0 };
      let bonuses = 0;
      let missionAllowances = 0;
      let absenceDays = 0;
      let penaltyDays = 0;
      let loans = 0;
      let otherDeductions = 0;

      empApprovedEffects.forEach(eff => {
        if (eff.type === 'overtime') {
          const cat = eff.overtimeCategory || 'day';
          overtimeHours[cat] = (overtimeHours[cat] || 0) + (Number(eff.units) || 0);
        } else if (eff.type === 'bonus') {
          bonuses += Number(eff.amount) || 0;
        } else if (eff.type === 'mission') {
          missionAllowances += Number(eff.amount) || 0;
        } else if (eff.type === 'absence') {
          absenceDays += Number(eff.units) || 0;
        } else if (eff.type === 'penalty') {
          penaltyDays += Number(eff.units) || 0;
        } else if (eff.type === 'loan') {
          loans += Number(eff.amount) || 0;
        } else if (eff.type === 'deduction') {
          otherDeductions += Number(eff.amount) || 0;
        }
      });

      return calculateEmployeeSalary(emp, {
        overtimeHours, bonuses, missionAllowances,
        absenceDays, penaltyDays, loans, otherDeductions
      }, settings);
    });
  }, [employees, effects, settings, activePeriod]);

  return (
    <HRContext.Provider
      value={{
        currentUser, switchUser,
        employees, addEmployee, updateEmployee, deleteEmployee,
        effects, addEffect, updateEffectStatus, deleteEffect,
        settings, setSettings,
        activePeriod, setActivePeriod,
        calculatePayrollForPeriod, resetToDemoData,
        adminPassword, verifyAdminPassword, verifyEmployeePassword,
        updateAdminPassword, updateEmployeePassword,
        isAppLocked, lockApp, unlockApp,
        factoryReset, clearAllEffects, clearAllEmployees, loadDemoData,
        restoreFullBackup,
        theme, toggleTheme
      }}
    >
      {children}
    </HRContext.Provider>
  );
}

export function useHR() {
  const context = useContext(HRContext);
  if (!context) {
    throw new Error('useHR must be used within an HRProvider');
  }
  return context;
}
