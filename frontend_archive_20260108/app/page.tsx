import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-gray-900">
          Welcome to <span className="text-blue-600">Mainstay</span>
        </h1>

        <p className="mt-3 text-2xl text-gray-700">
          Your AI-powered Task Assistance Agent
        </p>

        <div className="mt-6">
          <Link href="/dashboard" className="px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md">
            Get Started
          </Link>
        </div>
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t">
        <p className="text-gray-500">
          Powered by Advanced Agents
        </p>
      </footer>
    </div>
  );
}
