export default function Footer() {
  return (
    <footer className="w-full h-30 py-4 bg-primary-900 mt-10">
      <div className="px-4 text-center text-sm">
        © {new Date().getFullYear()}.
      </div>
    </footer>
  );
}
