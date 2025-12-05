import { useState, useContext } from "react"
import { Input } from "@/components/ui/input"
import { UserRound } from "lucide-react"
import { UserContext } from "../context/UserContext"

function Profile() {
  const { user } = useContext(UserContext);
  const [photo] = useState(`https://api.dicebear.com/8.x/avataaars/svg?seed=${user?.name || "Loading..."}`)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <UserRound className="w-7 h-7 text-gray-800" />
        <h1 className="text-3xl font-bold text-gray-800">Profil Saya</h1>
      </div>

      {/* Foto Section (tanpa edit photo) */}
      <div className="flex flex-col sm:flex-row items-center sm:gap-8 mb-8">
        <div className="relative">
          <img
            src={photo}
            alt="Profile Avatar"
            className="w-36 h-36 rounded-full object-cover border border-gray-300 shadow-sm"
          />
        </div>

        <div className="pt-4 md:pt-0 max-w-md text-center sm:text-left">
          <p className="text-gray-600 text-sm">
            Foto profil ini dibuat secara otomatis. Saat ini, penggantian foto tidak tersedia.
          </p>
        </div>
      </div>

      {/* Data User */}
      <div className="space-y-2">
        <label className="text-gray-700 font-medium text-sm">Data Pribadi</label>
        <Input
          type="text"
          value={user?.name || "Loading..."}
          readOnly
          className="bg-gray-100 border-none text-gray-700 text-base"
        />
      </div>
      <div className="space-y-2 mt-4">
        <Input
          type="email"
          value={user?.email || "Loading..."}
          readOnly
          className="bg-gray-100 border-none text-gray-700 text-base"
        />
      </div>
    </div>
  )
}

export default Profile
