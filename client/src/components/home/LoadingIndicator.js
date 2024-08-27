export default function LoadingIndicator({ message = "Loading..." }) {
    return (
        <div className="flex justify-center items-center h-48">
            <p className="text-lg font-medium text-blue-600 animate-pulse">
                {message}
            </p>
        </div>
    );
}
