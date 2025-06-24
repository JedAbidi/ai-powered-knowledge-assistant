import DocumentList from "@/components/DocumentList";

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary animate-fade-in-down">
            Manage Documents
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            View and delete your uploaded documents.
          </p>
        </div>
        <DocumentList />
      </div>
    </div>
  );
}