export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-6">😔</div>
        <h1 className="font-heading font-extrabold text-3xl text-dark mb-4">
          Zahlung abgebrochen
        </h1>
        <p className="text-gray-500 text-lg mb-8 leading-relaxed">
          Kein Problem! Du hast die Zahlung abgebrochen. Deine Bestellung wurde
          nicht aufgegeben. Du kannst jederzeit neu bestellen.
        </p>
        <a
          href="/#menu"
          className="inline-block bg-diavolored text-white font-bold px-8 py-3 rounded-full hover:bg-red-700 transition-colors"
        >
          Nochmal bestellen
        </a>
      </div>
    </div>
  );
}
