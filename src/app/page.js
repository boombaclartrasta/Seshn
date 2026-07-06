export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#111111] text-[#F0F0F0] font-sans">
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <p className="text-[#444444] text-xs tracking-widest uppercase mb-4">
          coming soon
        </p>
        <h1 className="text-5xl font-medium mb-4">
          study like an athlete
        </h1>
        <p className="text-[#888888] text-sm max-w-sm mb-8 leading-relaxed">
          track your sessions. measure your focus. share your progress.
        </p>

        <div className="flex gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            className="bg-[#161616] border border-[#2A2A2A] text-[#F0F0F0] text-sm px-4 py-3 rounded-full outline-none placeholder-[#444444] w-64"
          />
          <button className="bg-[#F0F0F0] text-[#111111] text-sm font-medium px-5 py-3 rounded-full">
            join waitlist
          </button>
        </div>
      </section>
    </main>
  )
}
