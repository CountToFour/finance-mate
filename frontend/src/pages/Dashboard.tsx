import {LogOut} from 'lucide-react'
import {useAuthStore} from "../store/auth.ts";

function Dashboard() {
    const {user, logout} = useAuthStore()
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-semibold">Witaj{user?.email ? `, $
{user.email}` : ''}!</h1>
                    <button onClick={logout} className="inline-flex items-center gap-2
px-3 py-2 rounded-xl border hover:bg-gray-50">
                        <LogOut className="w-4 h-4"/> Wyloguj
                    </button>
                </header>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="rounded-2xl border p-6"> Tu pojawi się Dashboard
                        (wydatki, rekomendacje…)
                    </div>
                    <div className="rounded-2xl border p-6"> Moduł rekomendacji –
                        wkrótce
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard