import React from "react";

export default function ConfirmModal({ open, date, onCancel, onConfirm, loading }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-4">Confirm booking</h3>
                <p className="mb-6">
                    Book <strong>{date.toDateString()}</strong>?
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 border rounded">
                        Cancel
                    </button>
                    <button
                        disabled={loading}
                        onClick={onConfirm}
                        className="px-4 py-2 rounded bg-blue-600 text-white"
                    >
                        {loading ? "Saving…" : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
}
