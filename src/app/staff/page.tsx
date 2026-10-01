'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Banknote,
  DollarSign,
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: 'Cashier' | 'Store Manager' | 'Stock Controller';
  pin: string;
  status: 'Active' | 'On Break' | 'Off Duty';
}

interface ShiftLog {
  id: string;
  staffName: string;
  startTime: string;
  endTime?: string;
  openingFloat: number;
  closingFloat?: number;
  expectedTotal?: number;
  status: 'Open' | 'Closed';
}

const DEFAULT_STAFF: StaffMember[] = [
  { id: '1', name: 'Sipho Ndlovu', role: 'Store Manager', pin: '1234', status: 'Active' },
  { id: '2', name: 'Lindiwe Mthembu', role: 'Cashier', pin: '5678', status: 'Active' },
  { id: '3', name: 'Anathi Mgijima', role: 'Stock Controller', pin: '9012', status: 'Off Duty' },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<ShiftLog[]>([]);
  const [activeShift, setActiveShift] = useState<ShiftLog | null>(null);
  
  // Modals state
  const [isNewStaffOpen, setIsNewStaffOpen] = useState(false);
  const [isStartShiftOpen, setIsStartShiftOpen] = useState(false);
  const [isEndShiftOpen, setIsEndShiftOpen] = useState(false);

  // Form Inputs
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'Cashier' | 'Store Manager' | 'Stock Controller'>('Cashier');
  const [newPin, setNewPin] = useState('');
  
  const [openingFloatInput, setOpeningFloatInput] = useState('');
  const [closingFloatInput, setClosingFloatInput] = useState('');

  useEffect(() => {
    const savedStaff = localStorage.getItem('forte_staff');
    if (savedStaff) {
      try {
        setStaff(JSON.parse(savedStaff));
      } catch (e) {
        setStaff(DEFAULT_STAFF);
      }
    } else {
      setStaff(DEFAULT_STAFF);
    }

    const savedShift = localStorage.getItem('forte_active_shift');
    if (savedShift) {
      try {
        setActiveShift(JSON.parse(savedShift));
      } catch (e) {
        setActiveShift(null);
      }
    }
  }, []);

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPin) return;

    const newMember: StaffMember = {
      id: Date.now().toString(),
      name: newName,
      role: newRole,
      pin: newPin,
      status: 'Active',
    };

    const updated = [...staff, newMember];
    setStaff(updated);
    localStorage.setItem('forte_staff', JSON.stringify(updated));

    setNewName('');
    setNewPin('');
    setIsNewStaffOpen(false);
  };

  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault();
    const floatVal = parseFloat(openingFloatInput) || 0;

    const newShift: ShiftLog = {
      id: `SH-${Math.floor(1000 + Math.random() * 9000)}`,
      staffName: staff[1]?.name || 'Lindiwe Mthembu',
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      openingFloat: floatVal,
      status: 'Open',
    };

    setActiveShift(newShift);
    localStorage.setItem('forte_active_shift', JSON.stringify(newShift));
    setIsStartShiftOpen(false);
    setOpeningFloatInput('');
  };

  const handleEndShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;

    const closingVal = parseFloat(closingFloatInput) || 0;
    const closedShift: ShiftLog = {
      ...activeShift,
      endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      closingFloat: closingVal,
      status: 'Closed',
    };

    setShifts((prev) => [closedShift, ...prev]);
    setActiveShift(null);
    localStorage.removeItem('forte_active_shift');
    setIsEndShiftOpen(false);
    setClosingFloatInput('');
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-5 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white">Staff & Shift Management</h1>
            <p className="text-xs text-slate-400">Control access levels and manage till drawer floats</p>
          </div>
        </div>

        <button
          onClick={() => setIsNewStaffOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-950/50 transition"
        >
          <UserPlus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* Active Till Shift Status */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Current Active Shift</h3>
          </div>
          <span
            className={`text-[10px] font-mono px-2.5 py-1 rounded-full border font-bold ${
              activeShift
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {activeShift ? 'REGISTER OPEN' : 'NO ACTIVE SHIFT'}
          </span>
        </div>

        {activeShift ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono">Cashier</p>
              <p className="text-xs font-bold text-white mt-0.5">{activeShift.staffName}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono">Opening Float</p>
              <p className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                R {activeShift.openingFloat.toFixed(2)}
              </p>
            </div>
            <div className="flex items-center justify-end">
              <button
                onClick={() => setIsEndShiftOpen(true)}
                className="bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition"
              >
                End Shift & Close Drawer
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/30 p-4 rounded-2xl border border-dashed border-slate-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <p className="text-xs text-slate-400">
                No shift is currently registered. Open a shift with an initial cash float before processing sales.
              </p>
            </div>
            <button
              onClick={() => setIsStartShiftOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap"
            >
              Start Shift & Open Till
            </button>
          </div>
        )}
      </div>

      {/* Staff Roster Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white">Employee Roster & Access Roles</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400">
            <thead className="bg-slate-900/80 text-slate-300 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Security PIN</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-slate-900/30 transition">
                  <td className="p-3 font-bold text-white">{member.name}</td>
                  <td className="p-3">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> {member.role}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-500">••••</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                        member.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : member.status === 'On Break'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Employee */}
      {isNewStaffOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-white">Add New Employee</h3>
            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-400">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Store Manager">Store Manager</option>
                  <option value="Stock Controller">Stock Controller</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400">4-Digit Security PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl font-bold"
                >
                  Save Employee
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewStaffOpen(false)}
                  className="px-4 bg-slate-900 text-slate-400 rounded-xl font-bold hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Start Shift */}
      {isStartShiftOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-400" /> Start Shift & Register Float
            </h3>
            <form onSubmit={handleStartShift} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Opening Till Float Amount (ZAR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 500"
                  value={openingFloatInput}
                  onChange={(e) => setOpeningFloatInput(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl font-bold"
                >
                  Open Register
                </button>
                <button
                  type="button"
                  onClick={() => setIsStartShiftOpen(false)}
                  className="px-4 bg-slate-900 text-slate-400 rounded-xl font-bold hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: End Shift */}
      {isEndShiftOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-white">End Shift & Close Drawer</h3>
            <form onSubmit={handleEndShift} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Counted Closing Cash Amount (ZAR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1850"
                  value={closingFloatInput}
                  onChange={(e) => setClosingFloatInput(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl font-bold"
                >
                  Reconcile & Close Register
                </button>
                <button
                  type="button"
                  onClick={() => setIsEndShiftOpen(false)}
                  className="px-4 bg-slate-900 text-slate-400 rounded-xl font-bold hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}