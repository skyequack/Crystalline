"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Quotation {
  id: string;
  quotationNumber: string;
  projectName: string;
  status: string;
  total: number | string;
  createdAt: Date | string;
  customer?: {
    companyName: string;
  };
  createdBy?: {
    name: string;
  };
}

interface QuotationsTableProps {
  quotations: Quotation[];
  statusColors: Record<string, string>;
}

export default function QuotationsTable({ quotations, statusColors }: QuotationsTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  const handleDeleteQuotation = async (id: string) => {
    try {
      const response = await fetch(`/api/quotations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeleteConfirm(null);
        router.refresh();
      } else {
        alert("Failed to delete quotation");
      }
    } catch (error) {
      console.error("Error deleting quotation:", error);
      alert("Failed to delete quotation");
    }
  };

  return (
    <>
      {quotations.map((quotation) => (
        <tr key={quotation.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <Link
              href={`/quotations/${quotation.id}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {quotation.quotationNumber}
            </Link>
          </td>
          <td className="px-6 py-4 text-sm text-black">
            <div className="max-w-xs truncate">
              {quotation.projectName}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
            {quotation.customer?.companyName || "N/A"}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
            AED{" "}
            {parseFloat(quotation.total.toString()).toLocaleString(
              "en-US",
              { minimumFractionDigits: 2 }
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span
              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                statusColors[quotation.status]
              }`}
            >
              {quotation.status}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
            {quotation.createdBy?.name || "System User"}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
            {new Date(quotation.createdAt).toLocaleDateString(
              "en-GB"
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            <button
              onClick={() => setDeleteConfirm(quotation.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
              title="Delete quotation"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </td>
        </tr>
      ))}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <tr>
          <td colSpan={8}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h2 className="text-2xl font-bold mb-4 text-red-600">Delete Quotation</h2>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete this quotation? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteQuotation(deleteConfirm)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
