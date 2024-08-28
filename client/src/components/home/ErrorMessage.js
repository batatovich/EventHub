export default function ErrorMessage({ message = "An error occurred.", details = "" }) {
    return (
        <div className="flex justify-center items-center h-48">
            <p className="text-lg font-medium text-red-600">
                {message}
            </p>
            {details && <p className="text-sm text-red-400 mt-2">{details}</p>}
        </div>
    );
}
