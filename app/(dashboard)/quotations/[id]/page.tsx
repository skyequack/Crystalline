"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, Edit, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Quotation {
  id: string;
  quotationNumber: string;
  projectName: string;
  siteLocation: string | null;
  status: string;
  subtotal: string;
  vatPercentage: string;
  vatAmount: string;
  total: string;
  notes: string | null;
  terms: string | null;
  createdAt: string;
  customer: {
    companyName: string;
    contactPerson: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  createdBy: {
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    scopeOfWork: string;
    description: string | null;
    quantity: string;
    rate: string;
    vatRate: string;
    subTotal: string;
  }>;
}

export default function QuotationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    fetchQuotation();
  }, [params.id]);

  const fetchQuotation = async () => {
    try {
      const response = await fetch(`/api/quotations/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setQuotation(data);
      }
    } catch (error) {
      console.error("Error fetching quotation:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/quotations/${params.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Quotation_${quotation?.quotationNumber}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading:", error);
      alert("Failed to download quotation");
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/quotations/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/quotations");
      } else {
        alert("Failed to delete quotation");
        setDeleteConfirm(false);
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete quotation");
      setDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setSavingStatus(true);
    try {
      const response = await fetch(`/api/quotations/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setPendingStatus(null);
        fetchQuotation();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Quotation not found</div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    SENT: "bg-blue-100 text-blue-800",
    REVISED: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/quotations"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quotations
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {quotation.quotationNumber}
            </h1>
            <p className="text-gray-600 mt-1">{quotation.projectName}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Download className="mr-2 h-5 w-5" />
              {downloading ? "Downloading..." : "Download Excel"}
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              disabled={deleting}
              className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">
            Project Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-medium text-black">
                {quotation.customer.companyName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact Person</p>
              <p className="font-medium text-black">
                {quotation.customer.contactPerson || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-black">
                {quotation.customer.phone || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-black">
                {quotation.customer.email || "-"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Site Location</p>
              <p className="font-medium text-black">
                {quotation.siteLocation || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created By</p>
              <p className="font-medium text-black">
                {quotation.createdBy.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium text-black">
                {new Date(quotation.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Status</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-2">Current Status</p>
              <span
                className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                  statusColors[quotation.status]
                }`}
              >
                {quotation.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Change Status</p>
              <select
                value={pendingStatus ?? quotation.status}
                onChange={(e) => setPendingStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 mb-3"
              >
                <option value="DRAFT" className="text-gray-900">
                  Draft
                </option>
                <option value="SENT" className="text-gray-900">
                  Sent
                </option>
                <option value="REVISED" className="text-gray-900">
                  Revised
                </option>
                <option value="APPROVED" className="text-gray-900">
                  Approved
                </option>
                <option value="REJECTED" className="text-gray-900">
                  Rejected
                </option>
              </select>
              <button
                onClick={() =>
                  handleStatusChange(pendingStatus ?? quotation.status)
                }
                disabled={savingStatus || pendingStatus === null}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingStatus ? "Saving..." : "Save Status"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">Line Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Scope of Work
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  VAT Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sub-Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotation.items.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-black">
                    <div className="font-medium">{item.scopeOfWork}</div>
                    {item.description && (
                      <div className="text-gray-600 mt-1 text-xs whitespace-pre-wrap max-w-2xl">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {parseFloat(item.quantity).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    AED{" "}
                    {parseFloat(item.rate).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    AED{" "}
                    {parseFloat(item.vatRate).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                    AED{" "}
                    {parseFloat(item.subTotal).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="max-w-md ml-auto space-y-3">
          <div className="flex justify-between text-black">
            <span>Subtotal:</span>
            <span className="font-medium">
              AED{" "}
              {parseFloat(quotation.subtotal).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between text-black">
            <span>VAT ({quotation.vatPercentage}%):</span>
            <span className="font-medium">
              AED{" "}
              {parseFloat(quotation.vatAmount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-black pt-3 border-t">
            <span>Grand Total:</span>
            <span>
              AED{" "}
              {parseFloat(quotation.total).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-600">
              Delete Quotation
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this quotation? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
