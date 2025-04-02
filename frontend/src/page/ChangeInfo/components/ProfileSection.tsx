import React, { useRef } from "react";
import { UserProfile, FormErrors } from "../../../types/userTypes";

interface ProfileSectionProps {
  profile: UserProfile;
  previewImage: string | null;
  errors: FormErrors;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  profile,
  previewImage,
  errors,
  onChange,
  onImageChange,
}) => {
  // 컴포넌트 내부에서 파일 입력 참조 관리
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    // null 체크와 함께 current 접근
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h2 className="font-bold text-lg mb-4">프로필 수정</h2>

      <div className="flex items-center mb-6">
        <div
          className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mr-4 overflow-hidden cursor-pointer"
          onClick={handleImageClick}
        >
          {previewImage || profile.profileImage ? (
            <img
              src={previewImage || profile.profileImage || ""}
              alt="프로필 이미지"
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="#AAAAAA"
              stroke="#AAAAAA"
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={onImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="text-sm text-gray-500">
          <p>프로필 사진을 변경하려면 클릭하세요.</p>
          <p className="text-xs mt-1">권장 크기: 500x500 픽셀</p>
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="nickname"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          닉네임 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nickname"
          name="nickname"
          value={profile.nickname}
          onChange={onChange}
          className={`w-full p-2 border rounded-lg ${
            errors.nickname ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="닉네임을 입력하세요"
        />
        {errors.nickname && (
          <p className="text-red-500 text-xs mt-1">{errors.nickname}</p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          상태 메시지
        </label>
        <textarea
          id="bio"
          name="bio"
          value={profile.bio}
          onChange={onChange}
          rows={3}
          className={`w-full p-2 border rounded-lg ${
            errors.bio ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="상태 메시지를 입력하세요"
        ></textarea>
        <p className="text-gray-500 text-xs mt-1">{profile.bio.length}/100자</p>
        {errors.bio && (
          <p className="text-red-500 text-xs mt-1">{errors.bio}</p>
        )}
      </div>

      {/* <div className="mb-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          이메일
        </label>
        <input
          type="email"
          id="email"
          value={profile.email}
          disabled
          className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500"
        />
        <p className="text-gray-500 text-xs mt-1">
          이메일은 변경할 수 없습니다.
        </p>
      </div> */}
    </div>
  );
};

export default ProfileSection;
