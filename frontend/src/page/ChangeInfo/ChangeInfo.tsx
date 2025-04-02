import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

import ProfileSection from "./components/ProfileSection";
import SettingsSection from "./components/SettingsSection";
import NotificationSettings from "./components/NotificationSettings";
import {
  UserProfile,
  FormErrors,
  NotificationSettings as NotificationSettingsType,
} from "../../types/userTypes";
import { useMyProfile, useUpdateProfile } from "../../hooks/useUser";
import { useAuthStore } from "../../store/authStore";

const compressImageIfNeeded = async (file: File): Promise<File> => {
  const FILE_SIZE_LIMIT = 5;
  const TARGET_SIZE = 4;
  const fileSizeMB = file.size / (1024 * 1024);

  if (fileSizeMB < FILE_SIZE_LIMIT) {
    console.log(
      `압축 불필요 (프로필): 파일 크기 ${fileSizeMB.toFixed(2)}MB (5MB 미만)`
    );
    return file;
  }

  try {
    const options = {
      maxSizeMB: TARGET_SIZE,
      maxWidthOrHeight: 1080,
      useWebWorker: true,
      initialQuality: 0.7,
    };

    console.log(
      `압축 시작 (프로필): 원본 크기 ${fileSizeMB.toFixed(2)}MB (5MB 이상)`
    );

    const compressedFile = await imageCompression(file, options);
    const compressedSizeMB = compressedFile.size / (1024 * 1024);

    console.log(
      `압축 완료 (프로필): ${compressedSizeMB.toFixed(2)}MB (${Math.round(
        (compressedFile.size / file.size) * 100
      )}% 크기)`
    );

    return compressedFile;
  } catch (error) {
    console.error("프로필 이미지 압축 실패:", error);
    return file;
  }
};

const ChangeInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore((state) => state);

  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useMyProfile();

  const updateProfileMutation = useUpdateProfile();

  const [profile, setProfile] = useState<UserProfile>({
    userId: "",
    nickname: "",
    bio: "",
    profileImage: null,
    email: "user@example.com",
    isPrivate: false,
    allowPhotoDownload: true,
    notificationSettings: {
      newFollower: true,
      newComment: true,
      photoRated: false,
      contestResult: true,
    },
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (profileData) {
      const userData = profileData.data;
      console.log("API에서 가져온 사용자 데이터:", userData);

      setProfile((prev) => ({
        ...prev,
        userId: userData.userId ? String(userData.userId) : "",
        nickname: userData.nickName || "",
        // API에서 받아온 message가 "-" 이면 빈 문자열로 표시, 아니면 그대로 사용
        bio: userData.message === "-" ? "" : userData.message || "",
        profileImage: userData.profileImage,
        email: prev.email,
        isPrivate: prev.isPrivate,
        allowPhotoDownload: prev.allowPhotoDownload,
        notificationSettings: prev.notificationSettings,
      }));

      setLoading(false);
    }
  }, [profileData]);

  useEffect(() => {
    setLoading(profileLoading);
  }, [profileLoading]);

  useEffect(() => {
    if (profileError) {
      console.error("프로필 로딩 오류:", profileError);
      setLoading(false);
    }
  }, [profileError]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev: UserProfile) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev: FormErrors) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleToggleChange = (name: string) => {
    setProfile((prev: UserProfile) => ({
      ...prev,
      [name]: !prev[name as keyof UserProfile],
    }));
  };

  const handleNotificationChange = (name: keyof NotificationSettingsType) => {
    setProfile((prev: UserProfile) => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [name]: !prev.notificationSettings[name],
      },
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewImage(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({
          ...prev,
          profileImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: FormErrors = {};

    if (!profile.nickname.trim()) {
      newErrors.nickname = "닉네임을 입력해주세요";
      isValid = false;
    } else if (profile.nickname.length > 20) {
      newErrors.nickname = "닉네임은 20자 이하로 입력해주세요";
      isValid = false;
    }

    // 상태 메시지 길이는 서버에서 "-" 로 처리하므로 클라이언트에서는 100자 제한만 검사
    if (profile.bio.length > 100) {
      newErrors.bio = "상태 메시지는 100자 이하로 입력해주세요";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const formData = new FormData();
      let fileToUpload: File | null = null;

      if (profile.profileImage && profile.profileImage.startsWith("data:")) {
        console.log("Base64 이미지 감지, 파일로 변환 시도...");
        const byteString = atob(profile.profileImage.split(",")[1]);
        const mimeString = profile.profileImage
          .split(",")[0]
          .split(":")[1]
          .split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const originalFile = new File([blob], "profile-image.jpg", {
          type: mimeString,
        });

        console.log(
          `원본 파일 크기 (변환됨): ${(
            originalFile.size /
            (1024 * 1024)
          ).toFixed(2)} MB`
        );
        fileToUpload = await compressImageIfNeeded(originalFile);
        console.log(
          `압축된 파일 크기 (Base64 경로): ${(
            fileToUpload.size /
            (1024 * 1024)
          ).toFixed(2)} MB`
        );
      } else if (previewImage) {
        console.log("Base64 이미지 없음, DOM에서 파일 찾기 시도...");
        const fileInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        if (fileInput && fileInput.files && fileInput.files[0]) {
          const originalFile = fileInput.files[0];
          console.log(
            `원본 파일 크기 (DOM): ${(
              originalFile.size /
              (1024 * 1024)
            ).toFixed(2)} MB`
          );
          fileToUpload = await compressImageIfNeeded(originalFile);
          console.log(
            `압축된 파일 크기 (DOM 경로): ${(
              fileToUpload.size /
              (1024 * 1024)
            ).toFixed(2)} MB`
          );
        } else {
          console.warn(
            "PreviewImage 존재하지만 DOM에서 파일 input/file을 찾을 수 없습니다."
          );
        }
      }

      if (fileToUpload) {
        formData.append("profileImageFile", fileToUpload, fileToUpload.name);
        console.log("압축된 파일 FormData에 추가됨.");
      } else {
        console.log("업로드할 새 프로필 이미지가 없습니다.");
      }

      formData.append("nickName", profile.nickname);

      // --- 상태 메시지 처리 수정 ---
      const messageToSend = profile.bio.trim() === "" ? "-" : profile.bio;
      formData.append("message", messageToSend);
      console.log("message로 전송될 값:", messageToSend);
      // --- 수정 완료 ---

      console.log("FormData 전송 시작...");
      updateProfileMutation.mutate(formData, {
        onSuccess: () => {
          setIsSaving(false);
          navigate("/mypage");
        },
        onError: (error) => {
          console.error("프로필 업데이트 실패:", error);
          setIsSaving(false);
        },
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/mypage");
  };

  if (loading) {
    return (
      <div className="flex flex-col max-w-md mx-auto min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-md mx-auto min-h-screen bg-gray-50">
      <div className="flex-1 p-4">
        <ProfileSection
          profile={profile}
          previewImage={previewImage}
          errors={errors}
          onChange={handleChange}
          onImageChange={handleImageChange}
        />

        {/* 주석 처리된 섹션 */}
        {/* <SettingsSection ... /> */}
        {/* <NotificationSettings ... /> */}

        <div className="flex mt-6 space-x-4">
          <button
            onClick={handleCancel}
            className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium"
            disabled={isSaving || updateProfileMutation.isPending}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || updateProfileMutation.isPending}
            className={`flex-1 py-3 rounded-lg text-white font-medium ${
              isSaving || updateProfileMutation.isPending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isSaving || updateProfileMutation.isPending
              ? "저장 중..."
              : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeInfoPage;
