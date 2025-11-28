import { client } from "@/sanity/lib/client";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import ResolveClaimButtons from "../../../../components/admin/ResolveClaimButtons"; // Componente cliente

async function getClaims() {
  return await client.fetch(`*[_type == "claim"] | order(date desc) {
    _id, reason, description, status, date,
    "orderNumber": order->orderNumber,
    "orderId": order->_id,
    "customer": order->customerName
  }`, {}, { cache: "no-store" });
}

export default async function ClaimsPage() {
  const claims = await getClaims();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <span className="bg-red-100 p-2 rounded-xl text-red-600"><AlertTriangle className="w-8 h-8"/></span>
        Centro de Reclamos
      </h1>

      <div className="grid gap-6">
        {claims.map((claim: any) => (
          <div key={claim._id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between gap-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  claim.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  claim.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {claim.status === 'pending' ? 'Pendiente' : claim.status === 'approved' ? 'Aprobado (Devolución)' : 'Rechazado'}
                </span>
                <span className="text-sm text-gray-500">{new Date(claim.date).toLocaleDateString()}</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900">Orden #{claim.orderNumber?.slice(-6)} - {claim.customer}</h3>
              <p className="font-semibold text-red-600">{claim.reason}</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">"{claim.description}"</p>
            </div>

            {/* BOTONES DE ACCIÓN (Solo si está pendiente) */}
            {claim.status === 'pending' && (
              <div className="flex flex-col gap-3 min-w-[200px]">
                <ResolveClaimButtons claimId={claim._id} orderId={claim.orderId} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}