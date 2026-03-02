require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const axios = require('axios'); // 이미지 검색용
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
// index.html 파일을 첫 화면으로 보여주는 설정입니다.
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
// 1. 주요 대학 로고 리스트 (직접 주소를 넣어두면 훨씬 정확합니다)
const staticLogos = {
    "서울대학교": "https://www.snu.ac.kr/snunow/snu_media/symbol/ui/download/snu_logo.png",
    "연세대학교": "https://www.yonsei.ac.kr/_res/yonsei/img/intro/img_symbol01.png",
    "고려대학교": "https://www.korea.ac.kr/mbshome/mbs/university/images/sub/logo_01.png",
    "한양대학교": "https://www.hanyang.ac.kr/html-repositories/images/custom/hanyang_logo.png",
    "성균관대학교": "https://www.skku.edu/_res/skku/img/common/logo_skku.png",
    "프린스턴": "https://e7.pngegg.com/pngimages/448/574/png-clipart-princeton-university-university-of-pennsylvania-purdue-university-cornell-university-teacher-text-orange-thumbnail.png",
    "Princeton University": "https://e7.pngegg.com/pngimages/448/574/png-clipart-princeton-university-university-of-pennsylvania-purdue-university-cornell-university-teacher-text-orange-thumbnail.png",
    "Standford University": "https://t1.daumcdn.net/brunch/service/user/2Biz/image/fbnqrIp8wwV7TwLste1vYQYsXXA.png",
    "UBC": "https://ires.ubc.ca/files/2020/02/ubc-logo.png",
    "UC Berkeley":"https://logos-world.net/wp-content/uploads/2022/02/UC-Berkeley-Symbol.png",
    "Harvard university":"https://1000logos.net/wp-content/uploads/2017/02/Harvard-Logo.png",
    "MIT":"https://icon2.cleanpng.com/20180609/wco/aa8b1ni35.webp",
    "을지대":"https://eulji.ac.kr/univ/images/sub/eu_about_pg04_01_img02.gif",
    "UAB":"https://upload.wikimedia.org/wikipedia/commons/1/1a/Logo_uab.png",
    "카이스트": "https://e7.pngegg.com/pngimages/977/494/png-clipart-logo-kaist-brand-number-product-design-travel-poster-singapore-blue-text.png",
    "Yale university":"https://rfleadership.org/wp-content/uploads/2022/08/230-2307146_transparent-yale-university-logo-hd-png-download-removebg-preview.png",
    "Brown university":"https://communications.biomed.brown.edu/themes/custom/brown/static/images/logo.png",
    "NYU":"https://logos-world.net/wp-content/uploads/2021/09/NYU-Emblem.png",
    "Colombia university":"https://e7.pngegg.com/pngimages/998/422/png-clipart-columbia-university-miller-school-of-albemarle-columbia-law-school-school-text-logo-thumbnail.png",
    "Boston university":"https://logos-world.net/wp-content/uploads/2022/01/Boston-University-Emblem.png",
    "University of Michigan - Ann Arbor":"https://1000logos.net/wp-content/uploads/2018/08/University-of-Michigan-Logo.png",
    "UCLA":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/UCLA_Bruins_logo.svg/1280px-UCLA_Bruins_logo.svg.png",
    "Georgia Institute of Technology":"https://brand.gatech.edu/sites/default/files/inline-images/GTLogoSeal_RGB.png",
    "University of Georgia":"https://1000logos.net/wp-content/uploads/2022/07/University-of-Georgia-Logo.png",
    "Cornell university":"https://1000logos.net/wp-content/uploads/2022/06/Cornell-University-Logo.png",
    "California Institute of Technology":"https://icon2.cleanpng.com/lnd/20250108/ik/7f6c61c9f3ef93766b09ce94bf0b7a.webp",
    "Carnegie Mellon University":"https://w7.pngwing.com/pngs/750/355/png-transparent-carnegie-mellon-university-in-qatar-carnegie-mellon-school-of-computer-science-integrated-innovation-institute-cornell-university-student-text-people-logo.png",
    "University of Pennsylvania":"https://branding.web-resources.upenn.edu/sites/default/files/styles/card_3x2/public/2022-03/UniversityofPennsylvania_FullLogo_RGB-4_0.png?h=ab080a2f&itok=tu_jMFEm",
    "스탠포드": "https://t1.daumcdn.net/brunch/service/user/2Biz/image/fbnqrIp8wwV7TwLste1vYQYsXXA.png",
    "버클리":"https://logos-world.net/wp-content/uploads/2022/02/UC-Berkeley-Symbol.png",
    "하버드":"https://1000logos.net/wp-content/uploads/2017/02/Harvard-Logo.png",
    "UAB":"https://upload.wikimedia.org/wikipedia/commons/1/1a/Logo_uab.png",
    "KAIST": "https://e7.pngegg.com/pngimages/977/494/png-clipart-logo-kaist-brand-number-product-design-travel-poster-singapore-blue-text.png",
    "예일":"https://rfleadership.org/wp-content/uploads/2022/08/230-2307146_transparent-yale-university-logo-hd-png-download-removebg-preview.png",
    "브라운":"https://communications.biomed.brown.edu/themes/custom/brown/static/images/logo.png",
    "NYU":"https://logos-world.net/wp-content/uploads/2021/09/NYU-Emblem.png",
    "콜롬비아":"https://e7.pngegg.com/pngimages/998/422/png-clipart-columbia-university-miller-school-of-albemarle-columbia-law-school-school-text-logo-thumbnail.png",
    "조지아텍":"https://brand.gatech.edu/sites/default/files/inline-images/GTLogoSeal_RGB.png",
    "코넬":"https://1000logos.net/wp-content/uploads/2022/06/Cornell-University-Logo.png",
    "칼텍":"https://icon2.cleanpng.com/lnd/20250108/ik/7f6c61c9f3ef93766b09ce94bf0b7a.webp",
    "카네기멜론":"https://w7.pngwing.com/pngs/750/355/png-transparent-carnegie-mellon-university-in-qatar-carnegie-mellon-school-of-computer-science-integrated-innovation-institute-cornell-university-student-text-people-logo.png",
    "유펜":"https://branding.web-resources.upenn.edu/sites/default/files/styles/card_3x2/public/2022-03/UniversityofPennsylvania_FullLogo_RGB-4_0.png?h=ab080a2f&itok=tu_jMFEm"



};

// 2. 구글 이미지 검색 함수
async function getUniversityLogo(univName) {
    const API_KEY = process.env.GOOGLE_API_KEY;
    const CX = process.env.GOOGLE_CX;
    
    // 대학명 뒤에 '로고 png'를 붙여서 검색 정확도를 높입니다.
    const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(univName)}+로고+png&searchType=image`;

    try {
        const response = await axios.get(url);
        // 검색 결과 중 첫 번째 이미지 반환
        if (response.data.items && response.data.items.length > 0) {
            return response.data.items[0].link;
        }
    } catch (error) {
        console.error("이미지 검색 에러:", error.message);
    }
    // 검색 실패 시 사용할 기본 로고 (학교 마크 아이콘 등)
    return "https://cdn-icons-png.flaticon.com/512/3203/3203934.png";
}

// 3. 메일 발송 로직
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/send', async (req, res) => {
    const { name, university, email } = req.body;

    // 1. 로고 결정
    // server.js 95번 줄 근처를 이렇게 수정해 보세요.
    // const finalLogo = staticLogos[university] || await getUniversityLogo(university);
    const finalLogo = "https://www.snu.ac.kr/snunow/snu_media/symbol/ui/download/snu_logo.png";

    // 2. 언어 판별 (대학 이름에 영문이 포함되어 있는지 확인)
    const isEnglish = /[a-zA-Z]/.test(university);

    // 3. 언어별 텍스트 설정
    const content = isEnglish ? {
        subject: `[Admissions] Congratulations on your acceptance to ${university}!`,
        title: "CERTIFICATE OF ADMISSION",
        body: `We are pleased to inform you that you have been officially accepted to <strong>${university}</strong> for the 2026 academic year. Your academic achievements and potential have impressed our admissions committee.`,
        date: "March 2, 2026",
        footer: `President of ${university}`,
        nameLabel: "Name",
        univLabel: "University"
    } : {
        subject: `[합격통지] ${name}님, ${university} 합격을 진심으로 축하드립니다!`,
        title: "합 격 통 지 서",
        body: `귀하는 본 대학교의 입학 전형에서 우수한 성적을 거두어 최종 합격하였음을 알려드립니다.`,
        date: "2026년 3월 2일",
        footer: `${university} 총장`,
        nameLabel: "성 명",
        univLabel: "합격대학"
    };

    const mailOptions = {
        from: `"Admissions Office" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: content.subject,
        html: `
            <div style="background-color: #f8f9fa; padding: 50px 20px; font-family: 'Arial', sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 60px; border: 12px double #b8860b; text-align: center; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
                    <img src="${finalLogo}" width="120" style="margin-bottom: 30px;" alt="University Logo">
                    <h1 style="color: #1a2a6c; letter-spacing: ${isEnglish ? '2px' : '8px'}; margin-bottom: 40px;">${content.title}</h1>
                    
                    <div style="text-align: left; padding: 0 20px; line-height: 2; font-size: 16px; color: #333;">
                        <p style="margin-bottom: 10px;"><strong>${content.nameLabel}:</strong> ${name}</p>
                        <p style="margin-bottom: 30px;"><strong>${content.univLabel}:</strong> ${university}</p>
                        <p style="text-align: justify;">${content.body}</p>
                    </div>

                    <div style="margin-top: 60px; border-top: 1px solid #eee; pt: 30px;">
                        <p style="font-size: 18px; color: #666;">${content.date}</p>
                        <h2 style="letter-spacing: 2px; color: #1a2a6c; margin-top: 20px;">${content.footer}</h2>
                        
                        <div style="display: inline-block; margin-top: 10px; width: 70px; height: 70px; border: 3px solid #cf352e; color: #cf352e; font-weight: bold; line-height: 35px; transform: rotate(-10deg); font-size: 14px; opacity: 0.8;">
                            OFFICIAL<br>SEAL
                        </div>
                    </div>
                </div>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) return res.status(500).send("실패");
        res.send("<h1>전송 성공! Check your Email.</h1>");
    });
});
// Render 서버가 주는 포트 번호를 사용하거나, 없으면 10000번을 사용합니다.
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 서버가 포트 ${PORT}에서 정상적으로 시작되었습니다!`);
});