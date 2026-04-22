    export default function HomePage() {
    return (
        <section className="relative h-screen w-full overflow-hidden">

        {/* Background image */}
        <img
            src="/images/HomePage.jpg"
            alt="background"
            className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Content */}
        <div className="relative z-10 flex h-full items-center justify-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold">
            Welcome
            </h1>
        </div>

        </section>
    );
    }