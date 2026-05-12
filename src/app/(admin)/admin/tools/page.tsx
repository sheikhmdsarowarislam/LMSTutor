"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Wrench, Plus, RefreshCw, ExternalLink, Pencil, Trash2, Eye, EyeOff, Clock, Infinity, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ToolVariation {
  label: string
  days: number
  price: number
  accessType: "timed" | "lifetime"
}

interface Tool {
  _id: string
  name: string
  slug: string
  shortDescription: string
  thumbnail?: { url: string }
  accessLink: string
  price: number
  discount: number
  variations: ToolVariation[]
  status: "draft" | "published" | "archived"
  enrollmentCount: number
  createdAt: string
}

interface PendingEnrollment {
  _id: string
  student: { name: string; email: string; avatar?: string }
  tool: { name: string; slug: string }
  variationLabel?: string
  amountPaid: number
  transactionId: string
  accessType: string
  createdAt: string
}

const EMPTY_FORM = {
  name: "",
  shortDescription: "",
  accessLink: "",
  price: 0,
  discount: 0,
  status: "draft" as "draft" | "published" | "archived",
  thumbnail: "",
  variations: [] as ToolVariation[],
}

export default function AdminToolsPage() {
  const { data: session } = useSession()
  const accessToken = session?.accessToken as string

  const [tools, setTools]             = useState<Tool[]>([])
  const [pending, setPending]         = useState<PendingEnrollment[]>([])
  const [loading, setLoading]         = useState(true)
  const [pendingLoading, setPendingLoading] = useState(false)
  const [activeTab, setActiveTab]     = useState<"tools" | "pending">("tools")
  const [error, setError]             = useState("")
  const [showForm, setShowForm]       = useState(false)
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [saving, setSaving]           = useState(false)
  const [form, setForm]               = useState(EMPTY_FORM)

  // Variation temp state
  const [varLabel, setVarLabel]       = useState("")
  const [varDays, setVarDays]         = useState("")
  const [varPrice, setVarPrice]       = useState("")
  const [varAccessType, setVarAccessType] = useState<"timed" | "lifetime">("lifetime")

  const API = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/tools`

  const fetchTools = async () => {
    setLoading(true); setError("")
    try {
      const res  = await fetch(`${API}/admin/all`, { headers: { Authorization: `Bearer ${accessToken}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed")
      setTools(data.data || [])
    } catch (err) { setError((err as Error).message) }
    finally { setLoading(false) }
  }

  const fetchPending = async () => {
    setPendingLoading(true)
    try {
      const res  = await fetch(`${API}/admin/pending`, { headers: { Authorization: `Bearer ${accessToken}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed")
      setPending(data.data?.enrollments || [])
    } catch (err) { setError((err as Error).message) }
    finally { setPendingLoading(false) }
  }

  useEffect(() => { if (accessToken) { fetchTools(); fetchPending() } }, [accessToken])

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true) }

  const openEdit = (tool: Tool) => {
    setForm({
      name: tool.name,
      shortDescription: tool.shortDescription,
      accessLink: tool.accessLink,
      price: tool.price,
      discount: Math.min(tool.discount ?? 0, 100),
      status: tool.status,
      thumbnail: tool.thumbnail?.url || "",
      variations: tool.variations || [],
    })
    setEditingId(tool._id); setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.accessLink) return
    setSaving(true)
    try {
      const url    = editingId ? `${API}/${editingId}` : `${API}/create`
      const method = editingId ? "PUT" : "POST"
      const body   = { ...form, price: Number(form.price) || 0, discount: Math.min(Number(form.discount) || 0, 100) }
      const res    = await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }, body: JSON.stringify(body) })
      const data   = await res.json()
      if (!res.ok) throw new Error(data.message || "Save failed")
      setShowForm(false); fetchTools()
    } catch (err) { setError((err as Error).message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tool?")) return
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } })
      if (!res.ok) throw new Error("Delete failed")
      fetchTools()
    } catch (err) { setError((err as Error).message) }
  }

  const handleToggleStatus = async (tool: Tool) => {
    const newStatus = tool.status === "published" ? "draft" : "published"
    try {
      await fetch(`${API}/${tool._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchTools()
    } catch (err) { setError((err as Error).message) }
  }

  const handleApprove = async (enrollmentId: string) => {
    try {
      const res = await fetch(`${API}/admin/enrollments/${enrollmentId}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) throw new Error("Approval failed")
      fetchPending(); fetchTools()
    } catch (err) { setError((err as Error).message) }
  }

  const handleReject = async (enrollmentId: string) => {
    const reason = prompt("Rejection reason (optional):")
    try {
      const res = await fetch(`${API}/admin/enrollments/${enrollmentId}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ reason: reason || "" }),
      })
      if (!res.ok) throw new Error("Rejection failed")
      fetchPending()
    } catch (err) { setError((err as Error).message) }
  }

  const addVariation = () => {
    if (!varLabel || !varPrice) return
    const days = varAccessType === "lifetime" ? 0 : Number(varDays)
    setForm(f => ({ ...f, variations: [...f.variations, { label: varLabel, days, price: Number(varPrice), accessType: varAccessType }] }))
    setVarLabel(""); setVarDays(""); setVarPrice(""); setVarAccessType("lifetime")
  }

  const removeVariation = (i: number) => setForm(f => ({ ...f, variations: f.variations.filter((_, idx) => idx !== i) }))

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Tools Management
          </h1>
          <p className="text-gray-400">Manage subscription tools and access requests</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { fetchTools(); fetchPending() }} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <Button onClick={openCreate} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 gap-2">
            <Plus className="h-4 w-4" /> Add Tool
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-900/50 p-1 rounded-xl border border-gray-800 w-fit">
        <button onClick={() => setActiveTab("tools")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "tools" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
          Tools <span className="ml-1.5 text-xs bg-gray-700 px-1.5 py-0.5 rounded-full">{tools.length}</span>
        </button>
        <button onClick={() => setActiveTab("pending")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "pending" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
          Pending Payments
          {pending.length > 0 && (
            <span className="ml-1.5 text-xs bg-pink-600 px-1.5 py-0.5 rounded-full">{pending.length}</span>
          )}
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}

      {/* ── PENDING PAYMENTS TAB ─────────────────────────────────────────── */}
      {activeTab === "pending" && (
        <div className="space-y-3">
          {pendingLoading && <p className="text-gray-500 text-sm">Loading...</p>}
          {!pendingLoading && pending.length === 0 && (
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500/40 mx-auto mb-3" />
              <p className="text-gray-400">No pending payments</p>
            </div>
          )}
          {pending.map(enrollment => (
            <div key={enrollment._id} className="bg-gray-900/60 border border-gray-800/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-medium text-sm">{enrollment.student.name}</span>
                  <span className="text-gray-500 text-xs">{enrollment.student.email}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
                  <span className="text-purple-400 font-medium">{enrollment.tool.name}</span>
                  {enrollment.variationLabel && (
                    <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full">
                      {enrollment.variationLabel}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full border ${enrollment.accessType === "timed" ? "bg-blue-500/10 border-blue-500/20 text-blue-300" : "bg-green-500/10 border-green-500/20 text-green-300"}`}>
                    {enrollment.accessType === "timed" ? <><Clock className="inline h-3 w-3 mr-1" />Timed</> : <><Infinity className="inline h-3 w-3 mr-1" />Lifetime</>}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  TxID: <span className="text-cyan-400 font-mono">{enrollment.transactionId}</span>
                  {" · "}৳{enrollment.amountPaid}
                  {" · "}{new Date(enrollment.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleApprove(enrollment._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">
                  <CheckCircle className="h-3.5 w-3.5" /> Approve
                </button>
                <button onClick={() => handleReject(enrollment._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/80 hover:bg-red-700 text-white text-xs rounded-lg transition-colors">
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TOOLS TAB ────────────────────────────────────────────────────── */}
      {activeTab === "tools" && (
        <>
          {/* CREATE / EDIT FORM */}
          {showForm && (
            <div className="mb-8 bg-gray-900/60 border border-gray-800/50 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">{editingId ? "Edit Tool" : "Create Tool"}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Tool Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    placeholder="e.g. AI Code Assistant" />
                </div>

                {/* SECURE ACCESS LINK */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Secure Access Link * <span className="text-purple-400 ml-1">(hidden from students)</span>
                  </label>
                  <input value={form.accessLink} onChange={e => setForm(f => ({ ...f, accessLink: e.target.value }))}
                    className="w-full bg-gray-800 border border-purple-700/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    placeholder="https://actual-tool-url.com" />
                  <p className="text-xs text-gray-600 mt-1">This URL is only revealed server-side after enrollment verification.</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-gray-400 mb-1 block">Short Description *</label>
                  <textarea value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
                    rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 resize-none" />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Base Price (৳)</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Discount (%)</label>
                  <input type="number" min={0} max={100} value={form.discount} onChange={e => setForm(f => ({ ...f, discount: Math.min(Number(e.target.value), 100) }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Thumbnail URL</label>
                  <input value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    placeholder="https://..." />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Variations */}
              <div>
                <label className="text-xs text-gray-400 mb-2 block">
                  Variations <span className="text-gray-600">(optional — supports timed & lifetime)</span>
                </label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  <input value={varLabel} onChange={e => setVarLabel(e.target.value)}
                    placeholder="Label (e.g. 1 Month)"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500 w-36" />

                  <select value={varAccessType} onChange={e => setVarAccessType(e.target.value as any)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500">
                    <option value="lifetime">Lifetime</option>
                    <option value="timed">Timed (days)</option>
                  </select>

                  {varAccessType === "timed" && (
                    <input type="number" value={varDays} onChange={e => setVarDays(e.target.value)}
                      placeholder="Days (e.g. 30)"
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500 w-28" />
                  )}

                  <input type="number" value={varPrice} onChange={e => setVarPrice(e.target.value)}
                    placeholder="Price (৳)"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500 w-28" />

                  <button onClick={addVariation}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors">
                    + Add
                  </button>
                </div>

                {form.variations.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.variations.map((v, i) => (
                      <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs rounded-full">
                        {v.accessType === "timed" ? <Clock className="h-3 w-3" /> : <Infinity className="h-3 w-3" />}
                        {v.label} — {v.accessType === "timed" ? `${v.days}d` : "∞"} — ৳{v.price}
                        <button onClick={() => removeVariation(i)} className="text-purple-400 hover:text-red-400">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg text-sm transition-colors">
                  Cancel
                </button>
                <Button onClick={handleSave} disabled={saving || !form.name || !form.accessLink}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                  {saving ? "Saving..." : editingId ? "Update Tool" : "Create Tool"}
                </Button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-12 text-center">
              <RefreshCw className="w-10 h-10 text-gray-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400">Loading tools...</p>
            </div>
          )}

          {/* Empty */}
          {!loading && tools.length === 0 && !error && (
            <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-12 text-center">
              <Wrench className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Tools Yet</h3>
              <Button onClick={openCreate} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0">
                <Plus className="h-4 w-4 mr-2" /> Add Tool
              </Button>
            </div>
          )}

          {/* Grid */}
          {!loading && tools.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map(tool => (
                <div key={tool._id} className="bg-gray-900/60 border border-gray-800/50 rounded-xl overflow-hidden flex flex-col">
                  <div className="h-36 bg-gray-800 relative">
                    {tool.thumbnail?.url
                      ? <img src={tool.thumbnail.url} alt={tool.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Wrench className="h-10 w-10 text-gray-600" /></div>
                    }
                    <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium
                      ${tool.status === "published" ? "bg-green-500/20 border border-green-500/40 text-green-400"
                        : tool.status === "draft" ? "bg-yellow-500/20 border border-yellow-500/40 text-yellow-400"
                        : "bg-gray-500/20 border border-gray-500/40 text-gray-400"}`}>
                      {tool.status}
                    </span>
                    {/* Slug badge */}
                    <span className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full bg-black/60 text-gray-300 font-mono">
                      /tools/{tool.slug}
                    </span>
                  </div>

                  <div className="p-4 flex-1 space-y-2">
                    <h3 className="text-white font-semibold text-sm">{tool.name}</h3>
                    <p className="text-gray-400 text-xs line-clamp-2">{tool.shortDescription}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-green-400 font-semibold">৳{tool.price}</span>
                      {tool.discount > 0 && <span className="text-gray-500">({tool.discount}% off)</span>}
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-500">{tool.enrollmentCount} enrolled</span>
                    </div>
                    {tool.variations?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tool.variations.map((v, i) => (
                          <span key={i} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full">
                            {v.accessType === "timed" ? <Clock className="h-2.5 w-2.5" /> : <Infinity className="h-2.5 w-2.5" />}
                            {v.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-600 font-mono truncate max-w-[120px]" title={tool.accessLink}>
                      🔒 {tool.accessLink.replace(/^https?:\/\//, "").substring(0, 20)}...
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                      <button onClick={() => handleToggleStatus(tool)}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                        {tool.status === "published" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => openEdit(tool)}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-yellow-400 transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(tool._id)}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}