import { profile } from "@/data/resume";
import ProfileLinks from "./ProfileLinks";

export default function Footer() {
  return (
    <footer className="border-t border-rule py-10">
      <div className="shell flex flex-col gap-4 text-sm text-faint sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name}, {profile.location}
        </p>
        <ProfileLinks className="flex flex-wrap gap-x-6 gap-y-2" />
      </div>
    </footer>
  );
}
