"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Users,
  Search,
  Plus,
  Trash2,
  X,
  ChevronLeft,
} from "lucide-react";
import { TripItem, TripMember } from "@/features/dashboard/types/dashboard.types";
import { tripService } from "@/services/trip.service";



interface Member extends TripMember {
  memberName: string;
}

interface Props {
  trips: TripItem[];
  accessToken: string;
  triggerToast: (message: string) => void;
}

const CollaboratorsPage: React.FC<Props> = ({
  trips,
  accessToken,
  triggerToast,
}) => {
  const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  const [formData, setFormData] = useState({
    memberName: "",
  });

  const fetchMembers = useCallback(async (tripId: string) => {
    try {
      setLoading(true);
      setMembers((await tripService.getMembers(tripId)) as Member[]);
    } catch {
      triggerToast("Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [triggerToast]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTrip) return;

    try {
      await tripService.addMember(selectedTrip._id, formData.memberName);
      triggerToast("Member added successfully");
      setShowAddModal(false);
      setFormData({
        memberName: "",
      });

      fetchMembers(selectedTrip._id);
    } catch {
      triggerToast("Failed to add member");
    }
  };

  const handleRemoveMember = async (member: Member) => {
    if (!selectedTrip) return;

    try {
      await tripService.removeMember(selectedTrip._id, member.userId);

      setMembers((current) => current.filter((item) => item.userId !== member.userId));
      setDeleteTarget(null);
      triggerToast("Member removed");
    } catch {
      triggerToast("Failed to remove member");
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter(
      (member) =>
        member.memberName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  useEffect(() => {
    if (selectedTrip) {
      queueMicrotask(() => {
        void fetchMembers(selectedTrip._id);
      });
    }
  }, [selectedTrip, fetchMembers]);

  return (
    <div className="space-y-6">
      {!selectedTrip ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Collaborators</h1>
              <p className="text-slate-400 text-sm">
                Manage trip members and permissions
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {trips.map((trip) => (
              <div
                key={trip._id}
                onClick={() => setSelectedTrip(trip)}
                className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="text-cyan-400" />
                  <div>
                    <h3 className="font-semibold text-white">{trip.title}</h3>
                    <p className="text-xs text-slate-400">
                      Manage collaborators
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => setSelectedTrip(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors bg-transparent border-none cursor-pointer"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {selectedTrip.title}
              </h2>
              <p className="text-slate-400 text-sm">Trip Members</p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors cursor-pointer border-none"
            >
              <Plus size={16} />
              Add Member
            </button>
          </div>

          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-10 pr-4 py-3 bg-[#080a10] border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No members found
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.userId}
                  className="flex justify-between items-center p-4 border-b border-white/5 last:border-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-white font-bold">
                      {member.memberName?.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <p className="text-white font-medium">
                        {member.memberName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded bg-white/10 text-slate-300">
                      {member.role}
                    </span>

                    <button
                      onClick={() => setDeleteTarget(member)}
                      className="text-rose-400 hover:text-rose-300 bg-transparent border-none cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className="bg-[#0c0f17] border border-white/10 rounded-2xl p-6 w-full max-w-md relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">Add Member</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Display Name
                </label>
                <input
                  required
                  placeholder="John Doe"
                  value={formData.memberName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      memberName: e.target.value,
                    }))
                  }
                  className="w-full p-3 rounded-xl bg-[#080a10] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors border-none cursor-pointer"
              >
                Add Member
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className="bg-[#0c0f17] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-bold mb-3">Remove Member?</h3>
            <p className="text-slate-400 text-sm mb-5">
              Remove <strong>{deleteTarget.memberName}</strong> from this trip?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 border border-white/10 rounded-xl text-slate-300 hover:bg-white/5 transition-colors bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveMember(deleteTarget)}
                className="flex-1 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors border-none cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaboratorsPage;
