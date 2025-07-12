// components/LoaderSkeleton.tsx
export default function LoaderSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
      <div className="bg-gray-200 rounded-2xl p-8 w-[500px] max-w-full">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-3/4 mx-auto bg-gray-400 rounded" />
          <div className="h-8 w-2/3 mx-auto bg-gray-400 rounded" />
          <div className="flex gap-6 my-6">
            <div className="h-8 w-1/3 bg-gray-400 rounded" />
            <div className="h-8 w-1/3 bg-gray-400 rounded" />
          </div>
          <div className="h-8 w-11/12 mx-auto bg-gray-400 rounded" />
          <div className="h-8 w-10/12 mx-auto bg-gray-400 rounded" />
          <div className="h-8 w-2/3 mx-auto bg-gray-400 rounded" />
          <hr className="my-4 border-gray-300" />
          <div className="h-6 w-1/3 mx-auto bg-gray-400 rounded" />
          <div className="flex gap-6 my-2 justify-center">
            <div className="h-8 w-1/4 bg-gray-400 rounded" />
            <div className="h-8 w-1/4 bg-gray-400 rounded" />
          </div>
          <hr className="my-4 border-gray-300" />
          <div className="h-8 w-1/4 mx-auto bg-gray-400 rounded" />
        </div>
      </div>
    </div>
  );
}
