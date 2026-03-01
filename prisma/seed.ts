import { PrismaClient, AgeGroup, BannerPosition } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.log("🌱 시드 데이터 생성 시작...");

  // ─── 관리자 계정 ─────────────────────────────────────
  const hashedPassword = await hash("Admin1234!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@kidsspace.kr" },
    update: {},
    create: {
      email: "admin@kidsspace.kr",
      password: hashedPassword,
      name: "관리자",
      nickname: "키즈공간관리자",
      role: "SUPER_ADMIN",
      grade: "VIP",
      provider: "EMAIL",
      status: "ACTIVE",
    },
  });

  const testUserPassword = await hash("Test1234!", 12);
  const testUser = await prisma.user.upsert({
    where: { email: "user@kidsspace.kr" },
    update: {},
    create: {
      email: "user@kidsspace.kr",
      password: testUserPassword,
      name: "테스트맘",
      nickname: "테스트맘",
      phone: "010-1234-5678",
      role: "USER",
      grade: "SILVER",
      points: 5000,
      provider: "EMAIL",
      status: "ACTIVE",
      children: {
        create: [
          { name: "지우", birthDate: new Date("2022-06-15"), gender: "MALE" },
          { name: "서연", birthDate: new Date("2024-01-20"), gender: "FEMALE" },
        ],
      },
      addresses: {
        create: {
          label: "집",
          recipientName: "테스트맘",
          phone: "010-1234-5678",
          zipCode: "06234",
          address: "서울특별시 강남구 테헤란로 123",
          addressDetail: "4층 401호",
          isDefault: true,
        },
      },
    },
  });

  console.log("✅ 사용자 생성 완료");

  // ─── 카테고리 (3depth) ───────────────────────────────

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "의류",
        slug: "clothing",
        description: "아이를 위한 의류 전체",
        depth: 0,
        sortOrder: 1,
        children: {
          create: [
            {
              name: "상의",
              slug: "clothing-tops",
              depth: 1,
              sortOrder: 1,
              children: {
                create: [
                  { name: "티셔츠", slug: "clothing-tops-tshirts", depth: 2, sortOrder: 1 },
                  { name: "맨투맨", slug: "clothing-tops-sweatshirts", depth: 2, sortOrder: 2 },
                  { name: "셔츠", slug: "clothing-tops-shirts", depth: 2, sortOrder: 3 },
                ],
              },
            },
            {
              name: "하의",
              slug: "clothing-bottoms",
              depth: 1,
              sortOrder: 2,
              children: {
                create: [
                  { name: "바지", slug: "clothing-bottoms-pants", depth: 2, sortOrder: 1 },
                  { name: "치마", slug: "clothing-bottoms-skirts", depth: 2, sortOrder: 2 },
                  { name: "레깅스", slug: "clothing-bottoms-leggings", depth: 2, sortOrder: 3 },
                ],
              },
            },
            {
              name: "아우터",
              slug: "clothing-outerwear",
              depth: 1,
              sortOrder: 3,
            },
          ],
        },
      },
      include: { children: { include: { children: true } } },
    }),
    prisma.category.create({
      data: {
        name: "장난감",
        slug: "toys",
        description: "연령별 장난감 모음",
        depth: 0,
        sortOrder: 2,
        children: {
          create: [
            { name: "교육 완구", slug: "toys-educational", depth: 1, sortOrder: 1 },
            { name: "블록·레고", slug: "toys-blocks", depth: 1, sortOrder: 2 },
            { name: "인형·피규어", slug: "toys-dolls", depth: 1, sortOrder: 3 },
            { name: "야외 놀이", slug: "toys-outdoor", depth: 1, sortOrder: 4 },
          ],
        },
      },
      include: { children: true },
    }),
    prisma.category.create({
      data: {
        name: "유아용품",
        slug: "baby-essentials",
        description: "필수 유아용품",
        depth: 0,
        sortOrder: 3,
        children: {
          create: [
            { name: "기저귀·물티슈", slug: "baby-diapers", depth: 1, sortOrder: 1 },
            { name: "수유용품", slug: "baby-feeding", depth: 1, sortOrder: 2 },
            { name: "목욕·스킨케어", slug: "baby-bath", depth: 1, sortOrder: 3 },
            { name: "외출용품", slug: "baby-outdoor", depth: 1, sortOrder: 4 },
          ],
        },
      },
      include: { children: true },
    }),
    prisma.category.create({
      data: {
        name: "도서",
        slug: "books",
        description: "아이를 위한 도서",
        depth: 0,
        sortOrder: 4,
        children: {
          create: [
            { name: "그림책", slug: "books-picture", depth: 1, sortOrder: 1 },
            { name: "학습 교재", slug: "books-study", depth: 1, sortOrder: 2 },
            { name: "전집·세트", slug: "books-sets", depth: 1, sortOrder: 3 },
          ],
        },
      },
      include: { children: true },
    }),
    prisma.category.create({
      data: {
        name: "가구·인테리어",
        slug: "furniture",
        description: "아이방 가구·인테리어",
        depth: 0,
        sortOrder: 5,
        children: {
          create: [
            { name: "책상·의자", slug: "furniture-desk", depth: 1, sortOrder: 1 },
            { name: "수납·정리", slug: "furniture-storage", depth: 1, sortOrder: 2 },
            { name: "침구", slug: "furniture-bedding", depth: 1, sortOrder: 3 },
          ],
        },
      },
      include: { children: true },
    }),
  ]);

  console.log("✅ 카테고리 생성 완료");

  // ─── 브랜드 ──────────────────────────────────────────

  const brands = await Promise.all([
    prisma.brand.create({ data: { name: "꼬마숲", slug: "little-forest", description: "자연 친화적 아동 의류 브랜드" } }),
    prisma.brand.create({ data: { name: "토이킹", slug: "toyking", description: "안전한 장난감 전문 브랜드" } }),
    prisma.brand.create({ data: { name: "베이비드림", slug: "babydream", description: "프리미엄 유아용품 브랜드" } }),
    prisma.brand.create({ data: { name: "키즈북", slug: "kidsbook", description: "아동 도서 전문 출판사" } }),
    prisma.brand.create({ data: { name: "해피홈", slug: "happyhome", description: "아이방 인테리어 전문 브랜드" } }),
    prisma.brand.create({ data: { name: "플레이앤런", slug: "play-and-learn", description: "놀이 중심 교육 완구 브랜드" } }),
    prisma.brand.create({ data: { name: "코코베이비", slug: "cocobaby", description: "오가닉 유아 스킨케어 브랜드" } }),
    prisma.brand.create({ data: { name: "스타키즈", slug: "starkids", description: "트렌디한 키즈 패션 브랜드" } }),
  ]);

  console.log("✅ 브랜드 생성 완료");

  // ─── 상품 ────────────────────────────────────────────

  const tshirtCategory = categories[0].children[0]?.children?.[0];
  const pantsCategory = categories[0].children[1]?.children?.[0];
  const eduToyCategory = categories[1].children[0];
  const blockCategory = categories[1].children[1];
  const diaperCategory = categories[2].children[0];
  const feedingCategory = categories[2].children[1];
  const pictureBookCategory = categories[3].children[0];
  const deskCategory = categories[4].children[0];

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "오가닉 코튼 반팔 티셔츠",
        slug: "organic-cotton-tshirt",
        description: "<p>100% 유기농 면으로 만든 부드러운 반팔 티셔츠입니다. 아이의 민감한 피부에도 안심하고 입힐 수 있어요.</p>",
        price: 29000,
        salePrice: 23200,
        categoryId: tshirtCategory!.id,
        brandId: brands[0].id,
        ageGroup: AgeGroup.AGE_3_5,
        thumbnail: "/images/products/organic-tshirt.jpg",
        stock: 150,
        salesCount: 320,
        avgRating: 4.7,
        reviewCount: 45,
        isFeatured: true,
        options: {
          create: [
            { name: "화이트 / 90", stock: 25, sku: "OT-W-90" },
            { name: "화이트 / 100", stock: 30, sku: "OT-W-100" },
            { name: "화이트 / 110", stock: 20, sku: "OT-W-110" },
            { name: "핑크 / 90", stock: 25, sku: "OT-P-90" },
            { name: "핑크 / 100", stock: 30, sku: "OT-P-100" },
            { name: "핑크 / 110", stock: 20, sku: "OT-P-110" },
          ],
        },
        images: {
          create: [
            { url: "/images/products/organic-tshirt-1.jpg", alt: "오가닉 코튼 반팔 티셔츠 정면", sortOrder: 0 },
            { url: "/images/products/organic-tshirt-2.jpg", alt: "오가닉 코튼 반팔 티셔츠 후면", sortOrder: 1 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "스트레치 데님 팬츠",
        slug: "stretch-denim-pants",
        description: "<p>신축성 좋은 데님 소재로 아이의 활동을 방해하지 않는 편안한 팬츠입니다.</p>",
        price: 35000,
        salePrice: 28000,
        categoryId: pantsCategory!.id,
        brandId: brands[7].id,
        ageGroup: AgeGroup.AGE_3_5,
        thumbnail: "/images/products/denim-pants.jpg",
        stock: 80,
        salesCount: 180,
        avgRating: 4.5,
        reviewCount: 28,
        options: {
          create: [
            { name: "블루 / 100", stock: 20, sku: "DP-B-100" },
            { name: "블루 / 110", stock: 20, sku: "DP-B-110" },
            { name: "블루 / 120", stock: 20, sku: "DP-B-120" },
            { name: "블랙 / 100", stock: 10, sku: "DP-K-100" },
            { name: "블랙 / 110", stock: 10, sku: "DP-K-110" },
          ],
        },
        images: {
          create: [
            { url: "/images/products/denim-pants-1.jpg", alt: "스트레치 데님 팬츠 정면", sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "알파벳 학습 블록 세트",
        slug: "alphabet-learning-blocks",
        description: "<p>알파벳과 숫자를 놀이로 배우는 원목 블록 세트입니다. 26개 알파벳 + 숫자 10개 + 기호 4개로 구성되어 있습니다.</p>",
        price: 45000,
        categoryId: eduToyCategory!.id,
        brandId: brands[5].id,
        ageGroup: AgeGroup.AGE_3_5,
        thumbnail: "/images/products/alphabet-blocks.jpg",
        stock: 60,
        salesCount: 520,
        avgRating: 4.9,
        reviewCount: 87,
        isFeatured: true,
        options: {
          create: [
            { name: "기본 세트", stock: 40, sku: "AB-BASIC" },
            { name: "확장 세트 (한글 포함)", stock: 20, sku: "AB-EXT", additionalPrice: 15000 },
          ],
        },
        images: {
          create: [
            { url: "/images/products/alphabet-blocks-1.jpg", alt: "알파벳 학습 블록 전체", sortOrder: 0 },
            { url: "/images/products/alphabet-blocks-2.jpg", alt: "알파벳 학습 블록 활용 예시", sortOrder: 1 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "대형 소프트 블록 100pcs",
        slug: "soft-blocks-100",
        description: "<p>부드러운 EVA 소재의 대형 블록 100개 세트입니다. 안전하고 가벼워서 어린 아이도 쉽게 쌓을 수 있어요.</p>",
        price: 58000,
        salePrice: 46400,
        categoryId: blockCategory!.id,
        brandId: brands[1].id,
        ageGroup: AgeGroup.AGE_1_2,
        thumbnail: "/images/products/soft-blocks.jpg",
        stock: 40,
        salesCount: 250,
        avgRating: 4.6,
        reviewCount: 34,
        isFeatured: true,
        options: {
          create: [
            { name: "파스텔 컬러", stock: 25, sku: "SB-PASTEL" },
            { name: "비비드 컬러", stock: 15, sku: "SB-VIVID" },
          ],
        },
        images: {
          create: [
            { url: "/images/products/soft-blocks-1.jpg", alt: "대형 소프트 블록 전체", sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "프리미엄 밤부 기저귀 (대형)",
        slug: "bamboo-diapers-large",
        description: "<p>대나무 섬유로 만든 친환경 기저귀입니다. 뛰어난 흡수력과 통기성으로 아이의 피부를 건강하게 지켜줍니다.</p>",
        price: 32000,
        salePrice: 27200,
        categoryId: diaperCategory!.id,
        brandId: brands[2].id,
        ageGroup: AgeGroup.AGE_6_12M,
        thumbnail: "/images/products/bamboo-diapers.jpg",
        stock: 200,
        salesCount: 890,
        avgRating: 4.8,
        reviewCount: 156,
        isFeatured: true,
        shippingFee: 0,
        maxQuantity: 10,
        options: {
          create: [
            { name: "대형 (9~14kg) 30매", stock: 100, sku: "BD-L-30" },
            { name: "대형 (9~14kg) 60매", stock: 50, sku: "BD-L-60", additionalPrice: 28000 },
            { name: "특대형 (12~17kg) 30매", stock: 50, sku: "BD-XL-30", additionalPrice: 3000 },
          ],
        },
        images: {
          create: [
            { url: "/images/products/bamboo-diapers-1.jpg", alt: "프리미엄 밤부 기저귀 패키지", sortOrder: 0 },
            { url: "/images/products/bamboo-diapers-2.jpg", alt: "프리미엄 밤부 기저귀 제품", sortOrder: 1 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "스테인리스 빨대컵 세트",
        slug: "stainless-straw-cup-set",
        description: "<p>BPA-free 스테인리스 소재의 빨대컵 3종 세트입니다. 200ml, 300ml, 400ml 사이즈로 아이의 성장에 맞춰 사용할 수 있습니다.</p>",
        price: 38000,
        categoryId: feedingCategory!.id,
        brandId: brands[2].id,
        ageGroup: AgeGroup.AGE_6_12M,
        thumbnail: "/images/products/straw-cup.jpg",
        stock: 70,
        salesCount: 310,
        avgRating: 4.4,
        reviewCount: 52,
        options: {
          create: [
            { name: "파스텔 핑크", stock: 25, sku: "SC-PINK" },
            { name: "파스텔 블루", stock: 25, sku: "SC-BLUE" },
            { name: "파스텔 그린", stock: 20, sku: "SC-GREEN" },
          ],
        },
        images: {
          create: [
            { url: "/images/products/straw-cup-1.jpg", alt: "스테인리스 빨대컵 세트 전체", sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "잘 자요 달님 그림책",
        slug: "goodnight-moon-picture-book",
        description: "<p>아이의 수면 습관 형성에 도움을 주는 베스트셀러 그림책입니다. 부드러운 일러스트와 편안한 이야기로 잠자리 독서에 최적입니다.</p>",
        price: 13000,
        categoryId: pictureBookCategory!.id,
        brandId: brands[3].id,
        ageGroup: AgeGroup.AGE_1_2,
        thumbnail: "/images/products/goodnight-moon.jpg",
        stock: 120,
        salesCount: 450,
        avgRating: 4.9,
        reviewCount: 102,
        isFeatured: true,
        options: {
          create: [
            { name: "보드북", stock: 80, sku: "GM-BOARD" },
            { name: "양장본", stock: 40, sku: "GM-HARD", additionalPrice: 5000 },
          ],
        },
        images: {
          create: [
            { url: "/images/products/goodnight-moon-1.jpg", alt: "잘 자요 달님 표지", sortOrder: 0 },
            { url: "/images/products/goodnight-moon-2.jpg", alt: "잘 자요 달님 내지", sortOrder: 1 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "높이조절 원목 책상 세트",
        slug: "adjustable-wood-desk-set",
        description: "<p>아이의 성장에 맞춰 높이를 조절할 수 있는 원목 책상·의자 세트입니다. 자작나무 원목으로 견고하고 안전합니다.</p>",
        price: 289000,
        salePrice: 249000,
        categoryId: deskCategory!.id,
        brandId: brands[4].id,
        ageGroup: AgeGroup.AGE_3_5,
        thumbnail: "/images/products/wood-desk.jpg",
        stock: 20,
        salesCount: 85,
        avgRating: 4.7,
        reviewCount: 19,
        shippingFee: 5000,
        options: {
          create: [
            { name: "내추럴", stock: 10, sku: "WD-NAT" },
            { name: "화이트", stock: 10, sku: "WD-WHT" },
          ],
        },
        images: {
          create: [
            { url: "/images/products/wood-desk-1.jpg", alt: "높이조절 원목 책상 세트 전체", sortOrder: 0 },
            { url: "/images/products/wood-desk-2.jpg", alt: "높이조절 원목 책상 높이 조절 모습", sortOrder: 1 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "실리콘 이유식 식기 세트",
        slug: "silicone-baby-tableware",
        description: "<p>식품용 실리콘으로 만든 이유식 식기 5종 세트입니다. 흡착 기능이 있어 뒤집힘을 방지합니다.</p>",
        price: 25000,
        salePrice: 19900,
        categoryId: feedingCategory!.id,
        brandId: brands[6].id,
        ageGroup: AgeGroup.AGE_6_12M,
        thumbnail: "/images/products/silicone-tableware.jpg",
        stock: 90,
        salesCount: 670,
        avgRating: 4.8,
        reviewCount: 98,
        isFeatured: true,
        options: {
          create: [
            { name: "코랄 핑크", stock: 30, sku: "ST-CORAL" },
            { name: "민트 그린", stock: 30, sku: "ST-MINT" },
            { name: "크림 옐로우", stock: 30, sku: "ST-CREAM" },
          ],
        },
        images: {
          create: [
            { url: "/images/products/silicone-tableware-1.jpg", alt: "실리콘 이유식 식기 세트", sortOrder: 0 },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "오가닉 아기 보습 로션 300ml",
        slug: "organic-baby-lotion",
        description: "<p>EWG 그린 등급 성분만을 사용한 유기농 아기 보습 로션입니다. 시어버터와 호호바 오일이 아이의 피부를 촉촉하게 보호합니다.</p>",
        price: 22000,
        categoryId: categories[2].children[2]!.id,
        brandId: brands[6].id,
        ageGroup: AgeGroup.AGE_0_6M,
        thumbnail: "/images/products/baby-lotion.jpg",
        stock: 130,
        salesCount: 780,
        avgRating: 4.9,
        reviewCount: 134,
        isFeatured: true,
        options: {
          create: [
            { name: "300ml", stock: 80, sku: "BL-300" },
            { name: "500ml (대용량)", stock: 50, sku: "BL-500", additionalPrice: 12000 },
          ],
        },
        images: {
          create: [
            { url: "/images/products/baby-lotion-1.jpg", alt: "오가닉 아기 보습 로션", sortOrder: 0 },
          ],
        },
      },
    }),
  ]);

  console.log("✅ 상품 생성 완료");

  // ─── 공지사항 ────────────────────────────────────────

  await prisma.notice.createMany({
    data: [
      {
        title: "키즈공간 오픈 안내",
        content: "<p>안녕하세요! 키즈 전문 쇼핑몰 <strong>키즈공간</strong>이 오픈했습니다. 오픈 기념으로 전 상품 20% 할인 이벤트를 진행합니다.</p>",
        isPinned: true,
        viewCount: 1250,
      },
      {
        title: "배송 안내 사항",
        content: "<p>3만원 이상 구매 시 무료 배송됩니다. 제주 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다.</p>",
        isPinned: true,
        viewCount: 890,
      },
      {
        title: "개인정보 처리방침 변경 안내",
        content: "<p>2026년 3월 1일부로 개인정보 처리방침이 변경됩니다. 자세한 내용은 약관 페이지를 확인해주세요.</p>",
        viewCount: 340,
      },
    ],
  });

  console.log("✅ 공지사항 생성 완료");

  // ─── FAQ ─────────────────────────────────────────────

  await prisma.fAQ.createMany({
    data: [
      { category: "주문/결제", question: "주문을 취소하고 싶어요.", answer: "<p>마이페이지 > 주문내역에서 취소 버튼을 눌러주세요. 배송 시작 전까지 취소가 가능합니다.</p>", sortOrder: 1 },
      { category: "주문/결제", question: "결제 수단은 어떤 것이 있나요?", answer: "<p>신용/체크카드, 무통장 입금, 카카오페이, 네이버페이, 토스페이를 이용하실 수 있습니다.</p>", sortOrder: 2 },
      { category: "배송", question: "배송은 얼마나 걸리나요?", answer: "<p>결제 완료 후 영업일 기준 1~3일 이내에 발송되며, 발송 후 1~2일 내에 도착합니다.</p>", sortOrder: 1 },
      { category: "배송", question: "배송비는 얼마인가요?", answer: "<p>3만원 이상 구매 시 무료 배송이며, 미만 시 3,000원의 기본 배송비가 부과됩니다.</p>", sortOrder: 2 },
      { category: "교환/반품", question: "교환·반품은 어떻게 하나요?", answer: "<p>수령 후 7일 이내에 마이페이지 > 주문내역에서 교환/반품 신청이 가능합니다. 고객 변심의 경우 반품 배송비가 발생합니다.</p>", sortOrder: 1 },
      { category: "회원", question: "비밀번호를 잊어버렸어요.", answer: "<p>로그인 페이지에서 '비밀번호 찾기' 버튼을 눌러주세요. 가입 시 등록한 이메일로 비밀번호 재설정 링크가 발송됩니다.</p>", sortOrder: 1 },
      { category: "회원", question: "회원 등급은 어떻게 올라가나요?", answer: "<p>최근 3개월 구매 금액에 따라 자동으로 등급이 변경됩니다. 브론즈(0원~), 실버(10만원~), 골드(30만원~), VIP(50만원~)로 나뉩니다.</p>", sortOrder: 2 },
      { category: "포인트/쿠폰", question: "포인트는 어떻게 적립되나요?", answer: "<p>구매 확정 시 결제 금액의 1%가 적립됩니다. 리뷰 작성 시 텍스트 리뷰 50P, 포토 리뷰 150P가 추가 적립됩니다.</p>", sortOrder: 1 },
    ],
  });

  console.log("✅ FAQ 생성 완료");

  // ─── 배너 ────────────────────────────────────────────

  await prisma.banner.createMany({
    data: [
      {
        title: "오픈 기념 전 상품 20% 할인",
        imageUrl: "/images/banners/hero-opening.jpg",
        mobileImageUrl: "/images/banners/hero-opening-mobile.jpg",
        linkUrl: "/shop",
        position: BannerPosition.MAIN_HERO,
        sortOrder: 1,
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-04-30"),
      },
      {
        title: "봄맞이 아우터 기획전",
        imageUrl: "/images/banners/hero-spring.jpg",
        mobileImageUrl: "/images/banners/hero-spring-mobile.jpg",
        linkUrl: "/shop/clothing-outerwear",
        position: BannerPosition.MAIN_HERO,
        sortOrder: 2,
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-05-31"),
      },
      {
        title: "베스트 장난감 모음",
        imageUrl: "/images/banners/mid-toys.jpg",
        linkUrl: "/shop/best",
        position: BannerPosition.MAIN_MIDDLE,
        sortOrder: 1,
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-12-31"),
      },
    ],
  });

  console.log("✅ 배너 생성 완료");

  // ─── 기획전 ──────────────────────────────────────────

  await prisma.exhibition.create({
    data: {
      title: "봄 신상 추천 아이템",
      slug: "spring-new-arrivals",
      description: "2026년 봄 시즌 신상품을 만나보세요!",
      bannerImage: "/images/exhibitions/spring-banner.jpg",
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-05-31"),
      products: {
        create: products.slice(0, 5).map((p, i) => ({
          productId: p.id,
          sortOrder: i,
        })),
      },
    },
  });

  console.log("✅ 기획전 생성 완료");

  // ─── 쿠폰 (테스트 사용자) ────────────────────────────

  await prisma.coupon.createMany({
    data: [
      {
        userId: testUser.id,
        name: "웰컴 쿠폰 10%",
        code: "WELCOME10",
        discountType: "PERCENT",
        discountValue: 10,
        minOrderAmount: 30000,
        maxDiscountAmount: 5000,
        expiresAt: new Date("2026-06-30"),
      },
      {
        userId: testUser.id,
        name: "오픈 기념 5,000원 할인",
        code: "OPEN5000",
        discountType: "AMOUNT",
        discountValue: 5000,
        minOrderAmount: 50000,
        expiresAt: new Date("2026-04-30"),
      },
    ],
  });

  console.log("✅ 쿠폰 생성 완료");

  // ─── 포인트 이력 (테스트 사용자) ──────────────────────

  await prisma.pointHistory.createMany({
    data: [
      {
        userId: testUser.id,
        type: "EARN",
        amount: 3000,
        balance: 3000,
        description: "가입 축하 포인트",
      },
      {
        userId: testUser.id,
        type: "EARN",
        amount: 2000,
        balance: 5000,
        description: "오픈 이벤트 포인트",
      },
    ],
  });

  console.log("✅ 포인트 이력 생성 완료");

  // ─── 커뮤니티 게시글 (시드 콘텐츠) ────────────────────

  await prisma.post.create({
    data: {
      userId: testUser.id,
      boardSlug: "parenting-tips",
      title: "3살 아이 수면 교육 성공기",
      content: "<p>저희 아이도 수면 교육 정말 힘들었는데, 이 방법으로 2주 만에 성공했어요! 자세한 후기 공유합니다.</p><p>1. 매일 같은 시간에 루틴 시작하기<br>2. 잠자리 독서 습관 들이기<br>3. 편안한 환경 만들기</p>",
      viewCount: 234,
      likeCount: 15,
      commentCount: 8,
      tags: {
        create: [
          { tag: "수면교육" },
          { tag: "3세" },
          { tag: "육아팁" },
        ],
      },
    },
  });

  await prisma.post.create({
    data: {
      userId: testUser.id,
      boardSlug: "product-reviews",
      title: "알파벳 블록 세트 한달 사용 후기",
      content: "<p>한달 전에 구매한 알파벳 블록 세트 리뷰입니다. 아이가 정말 좋아해서 매일 가지고 놀아요!</p>",
      viewCount: 156,
      likeCount: 22,
      commentCount: 5,
      linkedProductId: products[2].id,
      tags: {
        create: [
          { tag: "장난감리뷰" },
          { tag: "교육완구" },
          { tag: "알파벳" },
        ],
      },
    },
  });

  await prisma.post.create({
    data: {
      userId: testUser.id,
      boardSlug: "qna",
      title: "6개월 아기 이유식 시작 시기 질문이요",
      content: "<p>6개월 된 아기가 있는데 이유식 시작 시기와 방법이 궁금합니다. 경험 있으신 분들 조언 부탁드립니다!</p>",
      viewCount: 89,
      likeCount: 3,
      commentCount: 12,
      tags: {
        create: [
          { tag: "이유식" },
          { tag: "6개월" },
          { tag: "초보맘" },
        ],
      },
    },
  });

  console.log("✅ 게시글 생성 완료");

  // ─── 감사 로그 (관리자 초기 설정) ─────────────────────

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "CREATE",
      entity: "System",
      entityId: "init",
      changes: { description: "시스템 초기화 및 시드 데이터 생성" },
      ipAddress: "127.0.0.1",
    },
  });

  console.log("✅ 감사 로그 생성 완료");

  // ─── 인기 검색어 ─────────────────────────────────────

  await prisma.searchKeyword.createMany({
    data: [
      { keyword: "유기농 이유식", count: 1520 },
      { keyword: "블록 장난감", count: 1340 },
      { keyword: "아기 로션", count: 1280 },
      { keyword: "유아 신발", count: 1150 },
      { keyword: "그림책 세트", count: 980 },
      { keyword: "기저귀", count: 920 },
      { keyword: "유모차", count: 870 },
      { keyword: "수면조끼", count: 750 },
      { keyword: "이유식 식기", count: 680 },
      { keyword: "교육 완구", count: 620 },
    ],
  });

  console.log("✅ 인기 검색어 생성 완료");

  // ─── 재고 이력 (초기 입고) ────────────────────────────

  for (const product of products) {
    await prisma.stockHistory.create({
      data: {
        productId: product.id,
        type: "IN",
        quantity: product.stock,
        beforeStock: 0,
        afterStock: product.stock,
        reason: "초기 입고",
        createdBy: admin.id,
      },
    });
  }

  console.log("✅ 재고 이력 생성 완료");

  console.log("\n🎉 시드 데이터 생성 완료!");
  console.log("──────────────────────────────────");
  console.log("관리자: admin@kidsspace.kr / Admin1234!");
  console.log("테스트: user@kidsspace.kr / Test1234!");
  console.log("──────────────────────────────────");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
