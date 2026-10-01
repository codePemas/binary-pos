'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  Lock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Search,
  Shield,
} from 'lucide-react';

interface ShiftSession {
  id: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  openingFloat: number;
  cashSales: number;
  cardSales: number;
  expectedCash: number;
  actualCashCounted?: number;
  variance?: number;
  status: 'OPEN' | 'CLOSED';
}

interface StaffMember {
  id: string;
  name: string;
  role: 'Store Manager' | 'Cashier' | 'Inventory Clerk';
  pin: string;
  status: 'Active' | 'On Leave';
  shiftsCompleted: number;
}

const DEFAULT_STAFF: StaffMember[] = [
  { id: '1', name: 'Sipho Ndlovu', role: 'Store Manager', pin: '1234', status: 'Active', shiftsCompleted: 142 },
  { id: '2', name: 'Lindiwe Mthembu', role: 'Cashier', pin: '5678', status: 'Active', shiftsCompleted: 88 },
  { id: '3', name: 'Ayo Balogun', role: 'Inventory Clerk', pin: '9012', status: 'Active', shiftsCompleted: 64 },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(DEFAULT_STAFF);
  const [shifts, setShifts] = useState<ShiftSession[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'SHIFT_LOGS' | 'STAFF_LIST'>('SHIFT_LOGS');

  useEffect(() => {
    const savedShifts = localStorage.getItem('forte_shifts');
    if (savedShifts) {
      try {
        setShifts(JSON.parse(savedShifts));
      } catch (e) {
        setShifts([]);
      }
    }
  }, []);

  const totalVariance = shifts.reduce((acc, s) => acc + (s.variance || 0), 0);
  const closedShifts = shifts.filter((s) => s.status === 'CLOSED');

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" /> Staff & Shift Reconciliation Audit
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review cashier drawer closeouts, cash variances, and system access rights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('SHIFT_LOGS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'SHIFT_LOGS'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Shift Audit Logs ({closedShifts.length})
          </button>
          <button
            onClick={() => setActiveTab('STAFF_LIST')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'STAFF_LIST'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Staff Roster ({staff.length})
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Reconciled Shifts</p>
          <p className="text-2xl font-bold font-mono text-white">{closedShifts.length}</p>
        </div>
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Till Cash Variance</p>
          <p
            className={`text-2xl font-bold font-mono ${
              totalVariance === 0
                ? 'text-emerald-400'
                : totalVariance < 0
                ? 'text-red-400'
                : 'text-blue-400'
            }`}
          >
            R {totalVariance.toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-1">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Active Staff On Duty</p>
          <p className="text-2xl font-bold font-mono text-blue-400">
            {staff.filter((s) => s.status === 'Active').length}
          </p>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'SHIFT_LOGS' ? (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Shift Drawer Closeouts & Z-Reports
            </h3>
            <span className="text-xs font-mono text-slate-400">Stored in localStorage</span>
          </div>

          {shifts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No shift reports submitted yet. End a cashier shift on <span className="font-mono text-white">/cashier</span> to generate Z-Reports here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                    <th className="py-3 px-4">Shift ID</th>
                    <th className="py-3 px-4">Cashier</th>
                    <th className="py-3 px-4">Times</th>
                    <th className="py-3 px-4 text-right">Expected Cash</th>
                    <th className="py-3 px-4 text-right">Counted Cash</th>
                    <th className="py-3 px-4 text-right">Variance</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-xs font-mono">
                  {shifts.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-4 font-bold text-white">{s.id}</td>
                      <td className="py-3 px-4 font-sans text-slate-200">{s.cashierName}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {s.startTime} {s.endTime ? `- ${s.endTime}` : '(Ongoing)'}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        R {s.expectedCash.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        {s.actualCashCounted !== undefined ? `R ${s.actualCashCounted.toFixed(2)}` : '-'}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          (s.variance || 0) === 0
                            ? 'text-emerald-400'
                            : (s.variance || 0) < 0
                            ? 'text-red-400'
                            : 'text-blue-400'
                        }`}
                      >
                        {s.variance !== undefined ? `R ${s.variance.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            s.status === 'CLOSED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" /> Staff Profiles & PIN Credentials
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {staff.map((member) => (
              <div key={member.id} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-xs">{member.name}</h4>
                    <p className="text-[10px] text-blue-400 font-mono mt-0.5">{member.role}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {member.status}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex justify-between">
                  <span>Access PIN:</span>
                  <span className="text-white font-bold">****</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 flex justify-between">
                  <span>Shifts Logged:</span>
                  <span className="text-white font-bold">{member.shiftsCompleted}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}