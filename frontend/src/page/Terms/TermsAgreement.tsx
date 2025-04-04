import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const TermsAgreement: React.FC = () => {
  const navigate = useNavigate();
  const [requiredTermsChecked, setRequiredTermsChecked] = useState(false);
  const [marketingTermsChecked, setMarketingTermsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="w-full flex flex-col max-w-md mx-auto min-h-screen bg-gray-50 p-4">
      <div className="flex flex-col mt-8 mb-6">
        <h1 className="text-2xl font-bold text-center mb-2">
          서비스 이용 약관
        </h1>
        <p className="text-center text-gray-600">
          PicScore 서비스 이용을 위해 아래 약관에 동의해주세요.
        </p>
      </div>

      {/* 필수 약관 */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">서비스 이용 약관 (필수)</h2>
        <div className="h-48 overflow-y-auto bg-gray-50 p-3 rounded mb-3 text-sm">
          <p className="mb-2">제 1 조 (목적)</p>
          <p className="text-gray-700 mb-3">
            이 약관은 PicScore(이하 "회사"라 함)가 제공하는 사진 평가 및 공유
            서비스(이하 "서비스"라 함)를 이용함에 있어 회사와 이용자의 권리,
            의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>

          <p className="mb-2">제 2 조 (정의)</p>
          <p className="text-gray-700 mb-3">
            1. "서비스"란 회사가 제공하는 모든 서비스를 의미합니다.
            <br />
            2. "이용자"란 회사의 서비스에 접속하여 이 약관에 따라 회사가
            제공하는 서비스를 받는 회원 및 비회원을 말합니다.
            <br />
            3. "회원"이라 함은 회사에 개인정보를 제공하여 회원등록을 한 자로서,
            회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를
            계속적으로 이용할 수 있는 자를 말합니다.
          </p>

          <p className="mb-2">제 3 조 (약관의 효력 및 변경)</p>
          <p className="text-gray-700 mb-3">
            1. 이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력이
            발생합니다.
            <br />
            2. 회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 회사가
            제공하는 서비스 화면에 게시하거나 기타의 방법으로 이용자에게
            공지함으로써 그 효력이 발생합니다.
          </p>

          <p className="mb-2">제 4 조 (서비스의 제공 및 변경)</p>
          <p className="text-gray-700 mb-3">
            1. 회사는 다음과 같은 서비스를 제공합니다.
            <br />
            - 사진 분석 및 평가 서비스
            <br />
            - 사진 공유 및 소셜 네트워킹 서비스
            <br />
            - 각종 정보 제공 서비스
            <br />
            2. 회사는 서비스의 내용을 변경할 수 있으며, 이 경우에는 변경된
            서비스의 내용 및 제공일자를 명시하여 서비스 화면에 공지합니다.
          </p>
        </div>
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            className="w-4 h-4 mr-2 accent-pic-primary"
            checked={requiredTermsChecked}
            onChange={(e) => setRequiredTermsChecked(e.target.checked)}
          />
          서비스 이용 약관에 동의합니다. (필수)
        </label>
      </div>

      {/* 선택 약관 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">
          마케팅 정보 수신 동의 (선택)
        </h2>
        <div className="h-24 overflow-y-auto bg-gray-50 p-3 rounded mb-3 text-sm">
          <p className="mb-2">마케팅 정보 수신 동의</p>
          <p className="text-gray-700 mb-3">
            PicScore는 이용자의 마케팅 정보 수신 동의를 받고 다양한 이벤트,
            프로모션, 뉴스레터, 서비스 업데이트 등의 정보를 이메일, SMS, 앱 푸시
            알림 등의 방법으로 제공할 수 있습니다. 이 동의는 선택사항이며,
            동의하지 않더라도 기본 서비스 이용에는 제한이 없습니다.
          </p>
        </div>
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            className="w-4 h-4 mr-2 accent-pic-primary"
            checked={marketingTermsChecked}
            onChange={(e) => setMarketingTermsChecked(e.target.checked)}
          />
          마케팅 정보 수신에 동의합니다. (선택)
        </label>
      </div>

      <button
        className={`w-full py-3 rounded-lg text-white font-semibold ${
          isSubmitting || !requiredTermsChecked
            ? "bg-gray-400"
            : "bg-pic-primary"
        }`}
        onClick={() => {
          navigate("/");
        }}
        disabled={isSubmitting || !requiredTermsChecked}
      >
        {isSubmitting ? "처리 중..." : "동의하고 서비스 이용하기"}
      </button>
    </div>
  );
};

export default TermsAgreement;
