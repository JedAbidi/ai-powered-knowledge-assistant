import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center py-10">
      <h1 className="text-4xl font-bold text-primary">AI Knowledge Extractor</h1>
      <p className="mt-4 text-lg text-gray-600">
        Upload documents, ask questions, and extract knowledge with AI.
      </p>
      <Link href="/query">
      <button className="mt-6 px-4 py-2 bg-secondary text-white rounded hover:bg-primary">
        Start Chatting
      </button>
    </Link>
    </div>
  );
}