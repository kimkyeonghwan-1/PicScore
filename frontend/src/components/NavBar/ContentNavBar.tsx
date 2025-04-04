import { Bell, ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ContentNavbarProps {
  content: string;
}

function ContentNavBar({ content }: ContentNavbarProps) {
  const navigate = useNavigate();

  const GoBack = () => {
    navigate(-1);
  };
  return (
    <nav className="sticky z-10 top-0 w-full max-w-md bg-white shadow-2xs py-0.5 px-3">
      <div className="flex justify-between items-center">
        <ArrowLeftIcon className="w-10" onClick={GoBack} />
        {/* 로고 */}
        <div className="text-base font-bold">{content}</div>

        {/* 알림 벨 아이콘 */}
        <button className="p-2 rounded-full active:bg-gray-100">
          <Bell size={24} />
        </button>
      </div>
    </nav>
  );
}

export default ContentNavBar;
