import FileUpload from "@/components/FileUpload";

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary animate-fade-in-down">
            Upload Your Document
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload PDF, TXT, or DOCX files to extract knowledge with AI.
          </p>
        </div>
        <FileUpload />
      </div>
    </div>
  );
}