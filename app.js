'use strict';

const WORD_PAIRS = [
  ['모자','가발'], ['안경','선글라스'], ['라면','우동'], ['침대','소파'], ['지하철','기차'],
  ['영화관','공연장'], ['카페','술집'], ['치킨','돈가스'], ['샴푸','바디워시'], ['냉장고','에어컨'],
  ['택시','버스'], ['호텔','모텔'], ['경찰','경비원'], ['의사','간호사'], ['유튜브','넷플릭스'],
  ['인스타그램','틱톡'], ['노트북','태블릿'], ['볼펜','샤프'], ['맥주','탄산음료'], ['김치찌개','부대찌개'],
  ['우산','우비'], ['운동화','슬리퍼'], ['칫솔','면도기'], ['향수','데오드란트'], ['지갑','카드지갑'],
  ['에스컬레이터','엘리베이터'], ['도서관','서점'], ['수족관','동물원'], ['수영장','해수욕장'], ['캠핑장','펜션'],
  ['승무원','여행가이드'], ['요리사','제빵사'], ['카메라','쌍안경'], ['피아노','신디사이저'], ['기타','우쿨렐레'],
  ['야구','테니스'], ['볼링','당구'], ['축구','풋살'], ['헬스장','필라테스'], ['햄버거','샌드위치'],
  ['핫도그','샌드위치'], ['아이스크림','요거트'], ['커피','코코아'], ['차','에이드'], ['콜라','사이다'],
  ['도넛','베이글'], ['크루아상','소금빵'], ['떡볶이','라볶이'], ['초밥','김밥'], ['비빔밥','볶음밥'],
  ['만두','춘권'], ['국밥','설렁탕'], ['스테이크','삼겹살'], ['회','초밥'], ['맥주','막걸리'],
  ['편의점','마트'], ['백화점','아울렛'], ['코인세탁방','세탁소'], ['약국','병원'], ['미용실','네일샵'],
  ['노래방','클럽'], ['PC방','오락실'], ['놀이공원','워터파크'], ['박물관','미술관'], ['공항','기차역'],
  ['다리','터널'], ['골목','지하도'], ['베란다','옥상'], ['주방','화장실'], ['문','창문'],
  ['베개','쿠션'], ['이불','침낭'], ['커튼','블라인드'], ['세탁기','식기세척기'], ['청소기','공기청정기'],
  ['전자레인지','오븐'], ['선풍기','헤어드라이어'], ['충전기','보조배터리'], ['이어폰','헤드폰'], ['스마트워치','스마트밴드'],
  ['리모컨','게임패드'], ['키보드','타자기'], ['공책','다이어리'], ['달력','시간표'], ['지도','내비게이션'],
  ['비밀번호','PIN번호'], ['알람','타이머'], ['꿈','기억'], ['거짓말','비밀'], ['소문','가십'],
  ['탐정','기자'], ['변호사','검사'], ['교사','강사'], ['학생','인턴'], ['사장','팀장'],
  ['소개팅','면접'], ['결혼식','졸업식'], ['생일','기념일'], ['여권','신분증'], ['열쇠','도어락']
];

if (WORD_PAIRS.length !== 100) {
  throw new Error(`단어 조합은 100개여야 합니다. 현재: ${WORD_PAIRS.length}`);
}


// v11: 각 단어쌍은 의미권이 비슷한 20개 후보군을 사용합니다.
// 정답과 리플리 단어는 항상 포함되고, 표시 순서는 매 판 무작위입니다.
const GUESS_GROUPS = {
  headwear: ['모자','가발','비니','캡모자','버킷햇','헬멧','후드','두건','머리띠','헤어밴드','헤어핀','선캡','귀마개','목도리','마스크','안경','선글라스','헤어피스','스카프','핀'],
  eyewear: ['안경','선글라스','고글','렌즈','보안경','수경','돋보기','쌍안경','모노클','안대','VR기기','페이스실드','마스크','모자','렌즈케이스','안경집','선캡','헬멧','망원경','카메라'],
  noodles: ['라면','우동','국수','칼국수','짬뽕','짜장면','소바','쌀국수','냉면','비빔면','라볶이','파스타','잔치국수','수제비','라멘','탄탄면','우육면','막국수','메밀국수','쫄면'],
  rest: ['침대','소파','의자','안락의자','벤치','매트리스','리클라이너','쿠션','베개','이불','침낭','해먹','방석','빈백','쇼파베드','간이침대','요가매트','러그','돗자리','접이식의자'],
  rail: ['지하철','기차','전철','KTX','SRT','트램','모노레일','경전철','열차','버스','택시','승강장','기차역','지하철역','공항철도','고속버스','시외버스','셔틀버스','케이블카','리무진'],
  venue_show: ['영화관','공연장','극장','콘서트홀','뮤지컬극장','소극장','오페라하우스','미술관','박물관','경기장','체육관','강당','전시장','갤러리','야외무대','놀이공원','클럽','노래방','방탈출','축제장'],
  drink_place: ['카페','술집','바','펍','와인바','포장마차','호프집','이자카야','라운지','클럽','식당','베이커리','디저트카페','찻집','브런치카페','편의점','노래방','루프탑바','비어홀','칵테일바'],
  fried_food: ['치킨','돈가스','탕수육','새우튀김','감자튀김','핫도그','치즈스틱','닭강정','가라아게','텐동','돈부리','커틀릿','튀김만두','오징어튀김','고로케','생선가스','치킨너겟','족발','삼겹살','스테이크'],
  bath: ['샴푸','바디워시','린스','트리트먼트','비누','클렌저','폼클렌징','스크럽','치약','칫솔','면도기','면도크림','로션','샤워젤','입욕제','수건','샤워볼','데오드란트','향수','핸드워시'],
  cooling: ['냉장고','에어컨','선풍기','냉동고','김치냉장고','제습기','공기청정기','에어쿨러','환풍기','서큘레이터','가습기','히터','온풍기','보일러','정수기','제빙기','와인셀러','쿨러','냉풍기','건조기'],
  road_transport: ['택시','버스','승용차','지하철','기차','고속버스','시외버스','마을버스','셔틀버스','리무진','렌터카','카풀','오토바이','자전거','전동킥보드','트럭','밴','캠핑카','스쿨버스','공항버스'],
  lodging: ['호텔','모텔','리조트','펜션','호스텔','게스트하우스','민박','콘도','풀빌라','여관','캠핑장','글램핑','기숙사','별장','한옥스테이','레지던스','사우나','찜질방','숙소','방갈로'],
  uniform_jobs: ['경찰','경비원','소방관','군인','보안요원','교도관','형사','순경','경호원','구급대원','승무원','역무원','공무원','탐정','검사','변호사','기자','교사','간호사','의사'],
  medical_jobs: ['의사','간호사','약사','치과의사','한의사','수의사','응급구조사','물리치료사','방사선사','임상병리사','간호조무사','상담사','영양사','치위생사','의무병','구급대원','심리상담사','작업치료사','검안사','조산사'],
  video_services: ['유튜브','넷플릭스','티빙','웨이브','디즈니플러스','쿠팡플레이','왓챠','트위치','아프리카TV','치지직','인스타그램','틱톡','네이버TV','애플TV','프라임비디오','V LIVE','숏츠','릴스','라이브방송','OTT'],
  social_media: ['인스타그램','틱톡','유튜브','페이스북','X','스레드','카카오스토리','블로그','트위치','치지직','릴스','숏츠','라이브방송','디스코드','카카오톡','텔레그램','밴드','핀터레스트','레딧','커뮤니티'],
  portable_devices: ['노트북','태블릿','스마트폰','전자책','게임기','스마트워치','스마트밴드','PDA','미니PC','키보드','모니터','전자사전','그래픽태블릿','크롬북','울트라북','넷북','아이패드','맥북','휴대용모니터','보조배터리'],
  writing_tools: ['볼펜','샤프','연필','만년필','형광펜','사인펜','매직','붓펜','수정테이프','지우개','자','컴퍼스','색연필','크레파스','마커','노트','공책','다이어리','메모지','화이트보드펜'],
  fizzy_drinks: ['맥주','탄산음료','콜라','사이다','탄산수','에너지드링크','무알콜맥주','하이볼','막걸리','소주','와인','샴페인','진저에일','토닉워터','레몬에이드','에이드','아이스티','주스','커피','콤부차'],
  stew: ['김치찌개','부대찌개','된장찌개','순두부찌개','청국장','동태찌개','고추장찌개','짜글이','감자탕','육개장','설렁탕','국밥','곰탕','갈비탕','매운탕','샤브샤브','전골','알탕','닭볶음탕','김치전골'],
  rainwear: ['우산','우비','양산','장화','레인코트','우산모자','판초','방수재킷','바람막이','우산커버','방수화','모자','후드','돗자리','텐트','타프','방수팩','장갑','목도리','선캡'],
  footwear: ['운동화','슬리퍼','구두','샌들','부츠','로퍼','하이힐','크록스','워커','장화','축구화','러닝화','등산화','실내화','스니커즈','단화','플랫슈즈','아쿠아슈즈','골프화','캔버스화'],
  grooming: ['칫솔','면도기','치약','치실','구강청결제','전동칫솔','면도크림','빗','드라이어','손톱깎이','족집게','가위','샴푸','바디워시','세안제','수건','로션','향수','데오드란트','왁스'],
  scent: ['향수','데오드란트','바디미스트','섬유향수','디퓨저','방향제','로션','바디워시','샴푸','비누','핸드크림','애프터쉐이브','헤어미스트','탈취제','섬유유연제','캔들','룸스프레이','콜롱','오일','선크림'],
  wallet: ['지갑','카드지갑','동전지갑','머니클립','명함지갑','파우치','키링','휴대폰케이스','여권지갑','가방','백팩','클러치','에코백','크로스백','토트백','벨트백','필통','카드홀더','현금봉투','여권케이스'],
  building_move: ['에스컬레이터','엘리베이터','계단','무빙워크','리프트','곤돌라','케이블카','경사로','육교','지하도','복도','출입문','회전문','비상계단','승강기','화물엘리베이터','플랫폼','통로','현관','로비'],
  book_places: ['도서관','서점','독서실','북카페','문구점','학교','자료실','열람실','스터디카페','헌책방','출판사','박물관','미술관','강의실','사무실','책방','도서관열람실','전자도서관','기록관','아카이브'],
  animal_places: ['수족관','동물원','아쿠아리움','사파리','동물카페','목장','수목원','식물원','테마파크','박물관','체험관','해양관','곤충관','조류원','농장','공원','수영장','해수욕장','워터파크','놀이공원'],
  water_places: ['수영장','해수욕장','워터파크','계곡','바다','호수','온천','스파','수족관','리조트','찜질방','목욕탕','캠핑장','수상공원','요트장','서핑장','다이빙풀','래프팅장','아쿠아리움','펜션'],
  outdoor_lodging: ['캠핑장','펜션','글램핑','카라반','리조트','호텔','모텔','게스트하우스','민박','풀빌라','별장','방갈로','산장','야영장','콘도','한옥스테이','호스텔','휴양림','오토캠핑장','텐트'],
  travel_jobs: ['승무원','여행가이드','여행작가','조종사','관광통역사','호텔리어','역무원','버스기사','택시기사','여행플래너','도슨트','인솔자','통역사','기자','사진작가','유튜버','공항직원','선장','기관사','가이드'],
  food_jobs: ['요리사','제빵사','파티시에','바리스타','셰프','영양사','소믈리에','바텐더','정육사','조리사','제과사','푸드스타일리스트','식품연구원','서버','주방장','베이커','카페직원','케이터러','푸드트럭운영자','주방보조'],
  optics: ['카메라','쌍안경','망원경','돋보기','현미경','고글','안경','선글라스','캠코더','액션캠','드론','스마트폰','렌즈','웹캠','CCTV','프로젝터','스캐너','뷰파인더','VR기기','열화상카메라'],
  instruments_keys: ['피아노','신디사이저','전자피아노','오르간','키보드','아코디언','멜로디언','하프','기타','우쿨렐레','바이올린','첼로','플루트','클라리넷','색소폰','트럼펫','드럼','실로폰','마림바','DJ컨트롤러'],
  instruments_strings: ['기타','우쿨렐레','베이스','바이올린','첼로','비올라','하프','만돌린','밴조','거문고','가야금','피아노','신디사이저','드럼','플루트','색소폰','트럼펫','아코디언','리코더','멜로디언'],
  sports_ball: ['야구','테니스','축구','풋살','농구','배구','탁구','배드민턴','골프','볼링','당구','핸드볼','럭비','족구','스쿼시','소프트볼','피클볼','하키','라크로스','크리켓'],
  fitness: ['헬스장','필라테스','요가','크로스핏','PT','러닝','수영','복싱','클라이밍','스피닝','에어로빅','발레','댄스','체조','태권도','주짓수','킥복싱','스트레칭','홈트','트램펄린'],
  sandwich: ['햄버거','샌드위치','핫도그','토스트','파니니','베이글','랩','브리또','타코','서브샌드위치','피자','도넛','크루아상','김밥','주먹밥','샐러드','치킨버거','핫샌드','바게트','케밥'],
  dessert: ['아이스크림','요거트','젤라또','푸딩','케이크','빙수','셔벗','아사이볼','우유','크림','치즈케이크','아이스바','과일','스무디','밀크셰이크','프로즌요거트','디저트','마카롱','초콜릿','쿠키'],
  cafe_drinks: ['커피','코코아','차','에이드','라떼','아메리카노','카푸치노','에스프레소','모카','핫초코','녹차','홍차','밀크티','아이스티','레몬에이드','주스','스무디','탄산수','콜라','사이다'],
  bakery: ['도넛','베이글','크루아상','소금빵','식빵','바게트','머핀','스콘','프레첼','브리오슈','단팥빵','소보로','크림빵','모닝빵','파이','타르트','쿠키','케이크','와플','팬케이크'],
  rice_food: ['초밥','김밥','비빔밥','볶음밥','주먹밥','덮밥','오므라이스','유부초밥','회덮밥','김치볶음밥','카레라이스','규동','돈부리','리조또','필라프','쌈밥','돌솥밥','국밥','죽','컵밥'],
  dumpling: ['만두','춘권','딤섬','교자','샤오롱바오','군만두','물만두','찐만두','김치만두','고기만두','튀김만두','스프링롤','호빵','찐빵','고로케','전병','떡','어묵','순대','월남쌈'],
  soup: ['국밥','설렁탕','곰탕','갈비탕','육개장','감자탕','순댓국','돼지국밥','삼계탕','미역국','해장국','매운탕','알탕','된장찌개','김치찌개','부대찌개','순두부찌개','전골','샤브샤브','떡국'],
  meat: ['스테이크','삼겹살','목살','갈비','돈가스','치킨','불고기','제육볶음','바비큐','소시지','베이컨','닭갈비','족발','보쌈','양꼬치','곱창','대창','오리구이','햄버거','스테이크덮밥'],
  raw_fish: ['회','초밥','사시미','연어','참치','광어','육회','물회','회덮밥','유부초밥','김밥','포케','세비체','해산물','굴','문어숙회','새우','연어덮밥','참치회','스시'],
  alcohol: ['맥주','막걸리','소주','와인','하이볼','칵테일','위스키','샴페인','사케','청주','보드카','럼','진','데킬라','매실주','복분자주','무알콜맥주','생맥주','과실주','동동주'],
  retail: ['편의점','마트','슈퍼마켓','백화점','아울렛','시장','쇼핑몰','면세점','창고형마트','온라인몰','문구점','서점','약국','다이소','정육점','베이커리','꽃집','철물점','중고매장','팝업스토어'],
  service_shop: ['코인세탁방','세탁소','미용실','네일샵','약국','병원','편의점','카페','PC방','사진관','수선집','안경점','세차장','주유소','마사지샵','피부과','치과','헬스장','세탁방','무인세탁소'],
  nightlife: ['노래방','클럽','PC방','오락실','술집','펍','바','볼링장','당구장','방탈출','보드게임카페','만화카페','찜질방','영화관','공연장','코인노래방','포장마차','호프집','카지노','라운지'],
  attractions: ['놀이공원','워터파크','박물관','미술관','동물원','수족관','전망대','식물원','수목원','테마파크','과학관','전시장','아쿠아리움','사파리','공원','축제장','체험관','유적지','궁궐','랜드마크'],
  transit_places: ['공항','기차역','버스터미널','지하철역','항구','정류장','환승센터','택시승강장','터미널','주차장','휴게소','역','선착장','개찰구','승강장','로비','출국장','입국장','플랫폼','대합실'],
  structures: ['다리','터널','골목','지하도','육교','도로','고가도로','계단','복도','통로','교차로','횡단보도','지하차도','출입구','문','창문','현관','주차장','광장','로터리'],
  home_space: ['베란다','옥상','주방','화장실','거실','침실','현관','복도','다용도실','창고','테라스','마당','발코니','드레스룸','서재','방','계단','차고','세탁실','욕실'],
  openings: ['문','창문','현관문','방문','대문','자동문','회전문','미닫이문','방화문','비상구','창','베란다문','출입구','도어락','커튼','블라인드','셔터','문고리','잠금장치','게이트'],
  bedding: ['베개','쿠션','이불','침낭','매트리스','방석','담요','패드','토퍼','요','베드스프레드','목베개','바디필로우','전기장판','러그','돗자리','해먹','침대','소파','빈백'],
  window_cover: ['커튼','블라인드','롤스크린','셔터','버티컬','암막커튼','레이스커튼','창문','문','파티션','가림막','스크린','차양','어닝','캐노피','발','창호','방충망','필름','커튼봉'],
  home_appliance: ['세탁기','식기세척기','청소기','공기청정기','건조기','냉장고','전자레인지','오븐','에어컨','선풍기','제습기','가습기','정수기','로봇청소기','인덕션','전기밥솥','커피머신','믹서기','토스터','에어프라이어'],
  heat_appliance: ['전자레인지','오븐','에어프라이어','토스터','인덕션','가스레인지','전기포트','전기밥솥','그릴','전기팬','커피머신','믹서기','식기세척기','냉장고','전자오븐','멀티쿠커','압력솥','찜기','와플메이커','핫플레이트'],
  blow_appliance: ['선풍기','헤어드라이어','서큘레이터','에어컨','냉풍기','온풍기','환풍기','공기청정기','제습기','가습기','히터','송풍기','건조기','에어쿨러','진공청소기','스팀다리미','에어브러시','헤어스타일러','핸드드라이어','선풍기히터'],
  power: ['충전기','보조배터리','멀티탭','어댑터','케이블','USB허브','배터리','무선충전기','전원선','콘센트','파워뱅크','충전독','변압기','플러그','C타입케이블','라이트닝케이블','건전지','충전케이스','연장선','도킹스테이션'],
  audio: ['이어폰','헤드폰','스피커','에어팟','헤드셋','마이크','사운드바','블루투스스피커','라디오','턴테이블','앰프','DAC','이어버드','골전도이어폰','모니터스피커','노이즈캔슬링헤드폰','리시버','워크맨','MP3','오디오'],
  wearable: ['스마트워치','스마트밴드','시계','피트니스밴드','스마트링','이어폰','안경','VR기기','심박계','만보기','GPS워치','전자시계','손목시계','스포츠워치','헬스밴드','액션캠','보청기','반지','팔찌','밴드'],
  controller: ['리모컨','게임패드','조이스틱','키보드','마우스','트랙패드','핸들컨트롤러','VR컨트롤러','스마트폰','리모트','키패드','터치펜','스타일러스','미디컨트롤러','DJ컨트롤러','버튼패드','프레젠터','레이싱휠','아케이드스틱','리모트컨트롤러'],
  typing: ['키보드','타자기','노트북','태블릿','스마트폰','계산기','전자사전','피아노','신디사이저','키패드','숫자패드','게임패드','마우스','트랙패드','스타일러스','프린터','스캐너','모니터','공책','볼펜'],
  paper: ['공책','다이어리','노트','수첩','메모장','플래너','스케치북','일기장','가계부','문제집','교과서','앨범','캘린더','파일철','바인더','포스트잇','원고지','노트패드','문서','책'],
  planning: ['달력','시간표','스케줄러','플래너','다이어리','일정표','캘린더','알람','타이머','메모','할일목록','가계부','노트','지도','내비게이션','시계','날짜','시간','예약표','근무표'],
  navigation: ['지도','내비게이션','GPS','나침반','도로표지판','지하철노선도','안내판','약도','경로','주소','지도앱','교통앱','위성지도','등산지도','관광지도','기차노선도','버스노선도','좌표','방향표지','랜드마크'],
  security_code: ['비밀번호','PIN번호','패턴','인증번호','OTP','보안코드','암호','패스워드','잠금번호','생체인증','지문','얼굴인식','도어락','열쇠','카드키','QR코드','바코드','계정','아이디','토큰'],
  time_tool: ['알람','타이머','스톱워치','시계','캘린더','시간표','일정표','리마인더','카운트다운','모닝콜','벨','초시계','메트로놈','예약','스케줄러','플래너','마감','날짜','시간','진동'],
  mind: ['꿈','기억','상상','추억','환상','생각','망상','착각','기분','감정','의식','무의식','기억상실','악몽','소원','계획','아이디어','회상','예감','직감'],
  deception: ['거짓말','비밀','핑계','변명','사기','허풍','과장','숨김','위장','연기','속임수','진실','소문','가십','루머','오해','착각','모순','알리바이','침묵'],
  rumor: ['소문','가십','루머','뒷담화','뉴스','기사','제보','폭로','비밀','거짓말','SNS','커뮤니티','댓글','인터뷰','목격담','후기','소식','정보','이야기','썰'],
  investigation_jobs: ['탐정','기자','형사','경찰','검사','변호사','수사관','리포터','PD','사진기자','감사관','정보원','사설탐정','탐사보도기자','연구원','분석가','감정인','수의사','의사','교사'],
  law_jobs: ['변호사','검사','판사','경찰','형사','법무사','변리사','수사관','검찰수사관','공증인','교도관','경비원','탐정','기자','공무원','노무사','세무사','회계사','중재인','법학자'],
  education_jobs: ['교사','강사','교수','튜터','과외선생','코치','트레이너','학원강사','조교','멘토','상담사','연구원','학생','인턴','교장','원장','강연자','교육자','사서','보육교사'],
  junior_roles: ['학생','인턴','신입사원','알바생','수습','연습생','조교','대학생','고등학생','취준생','교육생','견습생','사원','주니어','계약직','아르바이트생','봉사자','연구생','교환학생','실습생'],
  management: ['사장','팀장','부장','과장','대리','대표','CEO','매니저','점장','원장','실장','본부장','이사','회장','리더','감독','코치','반장','파트장','책임자'],
  selection: ['소개팅','면접','오디션','미팅','데이트','상담','상견례','회의','발표','시험','면담','인터뷰','채용','고백','미팅앱','소개','토론','심사','평가','협상'],
  ceremony: ['결혼식','졸업식','입학식','장례식','돌잔치','생일파티','환갑잔치','시상식','개업식','송년회','신년회','약혼식','상견례','축제','공연','발표회','기념식','개회식','폐회식','회식'],
  special_day: ['생일','기념일','결혼기념일','졸업일','입학일','크리스마스','발렌타인데이','화이트데이','설날','추석','어버이날','어린이날','새해','휴가','공휴일','주말','월급날','시험일','데이트','축제'],
  identity_doc: ['여권','신분증','운전면허증','학생증','사원증','주민등록증','외국인등록증','카드키','출입증','회원증','자격증','비자','탑승권','티켓','명함','통장','카드','전자여권','보건증','수험표'],
  access: ['열쇠','도어락','비밀번호','카드키','자물쇠','PIN번호','열쇠고리','출입카드','문고리','잠금장치','스마트락','지문인식','얼굴인식','OTP','보안카드','게이트','현관문','비상키','자동문','리모컨']
};

const PAIR_GUESS_GROUPS = [
  'headwear','eyewear','noodles','rest','rail','venue_show','drink_place','fried_food','bath','cooling',
  'road_transport','lodging','uniform_jobs','medical_jobs','video_services','social_media','portable_devices','writing_tools','fizzy_drinks','stew',
  'rainwear','footwear','grooming','scent','wallet','building_move','book_places','animal_places','water_places','outdoor_lodging',
  'travel_jobs','food_jobs','optics','instruments_keys','instruments_strings','sports_ball','sports_ball','sports_ball','fitness','sandwich',
  'sandwich','dessert','cafe_drinks','cafe_drinks','fizzy_drinks','bakery','bakery','noodles','rice_food','rice_food',
  'dumpling','soup','meat','raw_fish','alcohol','retail','retail','service_shop','service_shop','service_shop',
  'nightlife','nightlife','attractions','attractions','transit_places','structures','structures','home_space','home_space','openings',
  'bedding','bedding','window_cover','home_appliance','home_appliance','heat_appliance','blow_appliance','power','audio','wearable',
  'controller','typing','paper','planning','navigation','security_code','time_tool','mind','deception','rumor',
  'investigation_jobs','law_jobs','education_jobs','junior_roles','management','selection','ceremony','special_day','identity_doc','access'
];

if (PAIR_GUESS_GROUPS.length !== WORD_PAIRS.length) {
  throw new Error('20지선다 후보군 매핑 오류');
}

function guessCandidatesForPair(pairIndex) {
  const group = GUESS_GROUPS[PAIR_GUESS_GROUPS[pairIndex]] || [];
  const [a, b] = WORD_PAIRS[pairIndex];
  const unique = [];
  [a, b, ...group].forEach(word => {
    if (word && !unique.includes(word)) unique.push(word);
  });
  if (unique.length < 20) throw new Error(`후보가 20개 미만입니다: ${pairIndex}`);
  const core = [a, b];
  const rest = shuffle(unique.filter(word => !core.includes(word))).slice(0, 18);
  return shuffle([...core, ...rest]);
}

const LIFE_PROMPTS = [
  '마라톤','번지점프','소개팅','해외여행','고백','이별','면접','아르바이트','지각','결석',
  '전학','자취','이사','캠핑','등산','낚시','수영','스키','스노보드','서핑',
  '스쿠버다이빙','스노클링','래프팅','카약','패러글라이딩','스카이다이빙','롤러코스터','워터파크','콘서트','페스티벌',
  '클럽','노래방','방탈출','귀신의집','찜질방','PC방','밤샘','해돋이','기차여행','배낭여행',
  '제주여행','유럽여행','혼자여행','운전','주차','렌터카','막차','첫차','택시','비행기',
  '호캉스','게스트하우스','펜션','놀이공원','야시장','축제','수능','토익','시험','발표',
  '팀플','공모전','대회','장학금','첫월급','퇴사','야근','회식','연애','짝사랑',
  '장거리연애','재회','결혼식','축가','헌팅','미팅','소개팅앱','데이트','술게임','숙취',
  '만취','금주','요리','베이킹','다이어트','헬스','PT','러닝','문신','피어싱',
  '탈색','염색','셀프커트','중고거래','환불','오디션','팬미팅','사인회','브이로그','라이브방송'
];

if (LIFE_PROMPTS.length !== 100) {
  throw new Error(`인생 조작단 제시어는 100개여야 합니다. 현재: ${LIFE_PROMPTS.length}`);
}

const screen = document.getElementById('screen');
const homeBtn = document.getElementById('homeBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalActions = document.getElementById('modalActions');

const ORDINALS = [
  '첫 번째','두 번째','세 번째','네 번째','다섯 번째','여섯 번째',
  '일곱 번째','여덟 번째','아홉 번째','열 번째','열한 번째','열두 번째'
];

const state = {
  totalPlayers: 5,
  players: [],
  roles: [],
  pairIndex: null,
  citizenWord: '',
  ripleyWord: '',
  revealIndex: 0,
  speakerIndex: 0,
  votes: [],
  currentVoter: 0,
  result: null,
  wordGuess: '',
  guessCandidates: [],
  phase: 'menu',
  secretTimer: null
};

const lifeState = {
  totalPlayers: 5,
  players: [],
  roles: [],
  promptIndex: null,
  prompt: '',
  revealIndex: 0,
  speakerIndex: 0,
  votes: [],
  currentVoter: 0,
  result: null,
  secretTimer: null
};

function esc(str) {
  return String(str).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function ordinal(index) {
  return ORDINALS[index] || `${index + 1}번째`;
}

function playerLabel(index) {
  return `${ordinal(index)} 플레이어`;
}

function makePlayers(count) {
  return Array.from({length: count}, (_, i) => playerLabel(i));
}

function render(html, phase = state.phase) {
  if (state.secretTimer) {
    clearTimeout(state.secretTimer);
    state.secretTimer = null;
  }
  state.phase = phase;
  screen.innerHTML = `<section class="page">${html}</section>`;
  homeBtn.classList.toggle('hidden', phase === 'menu');
  window.scrollTo(0, 0);
}

function toast(message) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1900);
}

function showModal(title, body, actions) {
  modalTitle.textContent = title;
  modalBody.innerHTML = body;
  modalActions.innerHTML = '';
  actions.forEach(action => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn ${action.className || ''}`.trim();
    btn.textContent = action.label;
    btn.addEventListener('click', () => {
      if (action.close !== false) hideModal();
      if (action.onClick) action.onClick();
    });
    modalActions.appendChild(btn);
  });
  modal.classList.remove('hidden');
}

function hideModal() {
  modal.classList.add('hidden');
}

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeWord(value) {
  return String(value || '').trim().replace(/\s+/g, '').toLowerCase();
}

function getUsedPairs() {
  try {
    const parsed = JSON.parse(localStorage.getItem('ripley-used-pairs-v11') || '[]');
    return Array.isArray(parsed) ? parsed.filter(Number.isInteger) : [];
  } catch {
    return [];
  }
}

function choosePairIndex() {
  let used = getUsedPairs();
  if (used.length >= WORD_PAIRS.length) used = [];
  const usedSet = new Set(used);
  const available = WORD_PAIRS.map((_, i) => i).filter(i => !usedSet.has(i));
  const picked = available[Math.floor(Math.random() * available.length)];
  used.push(picked);
  try { localStorage.setItem('ripley-used-pairs-v11', JSON.stringify(used)); } catch {}
  return picked;
}

function prepareRound() {
  state.players = makePlayers(state.totalPlayers);
  state.pairIndex = choosePairIndex();
  const pair = WORD_PAIRS[state.pairIndex];
  const flip = Math.random() < 0.5;
  state.citizenWord = pair[flip ? 1 : 0];
  state.ripleyWord = pair[flip ? 0 : 1];
  state.roles = shuffle(['ripley', ...Array(state.totalPlayers - 1).fill('citizen')]);
  state.revealIndex = 0;
  state.speakerIndex = 0;
  state.votes = [];
  state.currentVoter = 0;
  state.result = null;
  state.wordGuess = '';
  state.guessCandidates = [];
}

function playerWord(index) {
  return state.roles[index] === 'ripley' ? state.ripleyWord : state.citizenWord;
}

function ripleyIndex() {
  return state.roles.indexOf('ripley');
}

function citizenIndices() {
  return state.roles.map((role, i) => role === 'citizen' ? i : -1).filter(i => i >= 0);
}

function roleName(index) {
  return state.roles[index] === 'ripley' ? '리플리' : '시민';
}

function showMenu() {
  render(`
    <div class="hero hero-minimal">
      <span class="eyebrow">1 PHONE · SOCIAL DEDUCTION</span>
      <div class="logo">R<span class="i">I</span>PLEY</div>
      <p class="tagline">믿게 만들거나, 들켜라.</p>
    </div>
    <div class="game-grid game-grid-minimal">
      <button class="game-card game-card-play" id="citizenGame" type="button">
        <div class="game-kicker">GAME 01</div>
        <div class="game-title">리플리 – 시민을 속여라</div>
        <span class="card-action">플레이</span>
      </button>
      <button class="game-card game-card-play" id="lifeGame" type="button">
        <div class="game-kicker">GAME 02</div>
        <div class="game-title">리플리 – 인생 조작단</div>
        <span class="card-action">플레이</span>
      </button>
    </div>
  `, 'menu');
  document.getElementById('citizenGame').addEventListener('click', showIntro);
  document.getElementById('lifeGame').addEventListener('click', showLifeIntro);
}

function showIntro() {
  render(`
    <div class="panel compact-panel intro-panel minimal-panel">
      <span class="eyebrow">리플리 – 시민을 속여라</span>
      <h1 class="page-title">누가 다른가?</h1>
      <div class="win-condition-grid simple-win-grid">
        <div class="win-card ripley-win-card">
          <span class="win-role">리플리 1명</span>
          <b>시민인 척 숨고 단어를 훔쳐라</b>
        </div>
        <div class="win-card citizen-win-card">
          <span class="win-role">시민 다수</span>
          <b>리플리를 찾되 단어는 숨겨라</b>
        </div>
      </div>
      <div class="flow-strip flow-strip-5" aria-label="게임 진행 순서">
        <span class="flow-step"><b>1</b><em>단어</em></span>
        <span class="flow-step"><b>2</b><em>설명</em></span>
        <span class="flow-step"><b>3</b><em>심문</em></span>
        <span class="flow-step"><b>4</b><em>투표</em></span>
        <span class="flow-step"><b>5</b><em>역전</em></span>
      </div>
      <div class="micro-rule"><b>아무도 자신의 역할을 모릅니다.</b></div>
      <div class="btn-row action-row">
        <button id="setupBtn" class="btn btn-primary" type="button">게임 설정</button>
      </div>
    </div>
  `, 'intro');
  document.getElementById('setupBtn').addEventListener('click', showSetup);
}

function showSetup() {
  const citizens = Math.max(3, state.totalPlayers - 1);
  render(`
    <div class="panel minimal-panel">
      <span class="eyebrow">GAME SETUP</span>
      <h1 class="page-title">인원 설정</h1>
      <div class="role-config">
        <label class="count-control">
          <span class="count-label">총 인원</span>
          <input id="totalPlayers" class="number-input" type="number" min="4" max="12" inputmode="numeric" value="${state.totalPlayers}" />
        </label>
        <div class="count-control ripley-box">
          <span class="count-label">리플리</span>
          <div class="number-input" style="display:grid;place-items:center">1</div>
        </div>
        <div class="count-control citizen-box">
          <span class="count-label">시민</span>
          <div id="citizenCount" class="number-input" style="display:grid;place-items:center">${citizens}</div>
        </div>
      </div>
      <div id="setupError" class="setup-error hidden"></div>
      <div class="btn-row">
        <button id="startRoundBtn" class="btn btn-primary" type="button">게임 시작</button>
      </div>
    </div>
  `, 'setup');

  const totalEl = document.getElementById('totalPlayers');
  const citizenEl = document.getElementById('citizenCount');
  const errorEl = document.getElementById('setupError');
  const startBtn = document.getElementById('startRoundBtn');
  const refresh = () => {
    const total = Number(totalEl.value);
    const error = !Number.isInteger(total) || total < 4 || total > 12 ? '총 인원은 4명부터 12명까지 가능합니다.' : '';
    citizenEl.textContent = Number.isInteger(total) ? Math.max(0, total - 1) : '-';
    startBtn.disabled = Boolean(error);
    errorEl.classList.toggle('hidden', !error);
    errorEl.textContent = error;
  };
  totalEl.addEventListener('input', refresh);
  refresh();

  startBtn.addEventListener('click', () => {
    const total = Number(totalEl.value);
    if (!Number.isInteger(total) || total < 4 || total > 12) {
      toast('총 인원은 4명부터 12명까지 가능합니다.');
      return;
    }
    state.totalPlayers = total;
    prepareRound();
    showHandoff();
  });
}

function showHandoff() {
  const i = state.revealIndex;
  render(`
    <div class="panel handoff minimal-panel">
      <span class="player-chip">단어 ${i + 1} / ${state.totalPlayers}</span>
      <div class="big-player">${esc(state.players[i])}</div>
      <p class="handoff-note">휴대폰을 넘겨주세요.</p>
      <div class="btn-row"><button id="revealBtn" class="btn btn-primary" type="button">단어 확인</button></div>
    </div>
  `, 'reveal-handoff');
  document.getElementById('revealBtn').addEventListener('click', showSecretWord);
}

function showSecretWord() {
  const i = state.revealIndex;
  render(`
    <div class="panel word-stage minimal-panel">
      <div class="word-label">당신의 단어</div>
      <div class="secret-word">${esc(playerWord(i))}</div>
      <div class="timer-track"><div class="timer-bar"></div></div>
      <p class="micro-copy">역할은 공개되지 않습니다.</p>
      <div class="btn-row"><button id="seenBtn" class="btn btn-primary" type="button">확인</button></div>
    </div>
  `, 'reveal-word');

  let closed = false;
  const finish = () => {
    if (closed) return;
    closed = true;
    state.revealIndex += 1;
    if (state.revealIndex >= state.totalPlayers) showReady();
    else showHandoff();
  };
  document.getElementById('seenBtn').addEventListener('click', finish);
  state.secretTimer = setTimeout(finish, 6000);
}

function showReady() {
  render(`
    <div class="panel handoff minimal-panel">
      <span class="eyebrow">READY</span>
      <div class="big-player">설명 시작</div>
      <p class="handoff-note">너무 많이 알려주지 마세요.</p>
      <div class="btn-row"><button id="beginTalkBtn" class="btn btn-primary" type="button">시작</button></div>
    </div>
  `, 'ready');
  document.getElementById('beginTalkBtn').addEventListener('click', () => { state.speakerIndex = 0; showSpeaker(); });
}

function showSpeaker() {
  const i = state.speakerIndex;
  const pct = ((i + 1) / state.totalPlayers) * 100;
  render(`
    <div class="panel minimal-panel">
      <div class="progress-wrap">
        <div class="progress-meta"><span>설명</span><span>${i + 1} / ${state.totalPlayers}</span></div>
        <div class="progress"><div style="width:${pct}%"></div></div>
      </div>
      <div class="speaker-box speaker-box-minimal">
        <div class="speaker-name">${esc(state.players[i])}</div>
        <div class="speaker-help">자기 단어를 기준으로 한마디.</div>
      </div>
      <div class="btn-row"><button id="speechDoneBtn" class="btn btn-primary" type="button">다음</button></div>
    </div>
  `, 'speaker');
  document.getElementById('speechDoneBtn').addEventListener('click', () => {
    if (state.speakerIndex + 1 >= state.totalPlayers) showInterrogation();
    else { state.speakerIndex += 1; showSpeaker(); }
  });
}

function showInterrogation() {
  render(`
    <div class="panel handoff minimal-panel">
      <span class="eyebrow">INTERROGATION</span>
      <div class="big-player">심문</div>
      <p class="handoff-note">각자 한 명에게 질문 1회.</p>
      <div class="micro-rule rule-pill"><b>답변은 단어 기준 · 정치 발언은 자유</b></div>
      <div class="btn-row"><button id="voteStartBtn" class="btn btn-primary" type="button">비밀 투표</button></div>
    </div>
  `, 'interrogation');
  document.getElementById('voteStartBtn').addEventListener('click', () => {
    state.currentVoter = 0;
    state.votes = [];
    showVoteHandoff();
  });
}

function showVoteHandoff() {
  const i = state.currentVoter;
  render(`
    <div class="panel handoff minimal-panel">
      <span class="player-chip">투표 ${i + 1} / ${state.totalPlayers}</span>
      <div class="big-player">${esc(state.players[i])}</div>
      <p class="handoff-note">휴대폰을 넘겨주세요.</p>
      <div class="vote-status">${Array.from({length: state.totalPlayers}, (_, d) => `<span class="vote-dot ${d < i ? 'done' : ''}"></span>`).join('')}</div>
      <div class="btn-row"><button id="voteOpenBtn" class="btn btn-primary" type="button">투표하기</button></div>
    </div>
  `, 'vote-handoff');
  document.getElementById('voteOpenBtn').addEventListener('click', showVoteChoices);
}

function showVoteChoices() {
  const voter = state.currentVoter;
  render(`
    <div class="panel vote-private minimal-panel vote-choice-panel">
      <span class="player-chip">투표 ${voter + 1} / ${state.totalPlayers}</span>
      <h1 class="page-title vote-title">누가 리플리인가요?</h1>
      <div class="vote-grid dynamic-vote-grid">
        ${state.players.map((p, i) => i === voter ? '' : `<button class="person-btn" data-vote="${i}" type="button">${esc(p)}</button>`).join('')}
      </div>
    </div>
  `, 'vote-choice');
  document.querySelectorAll('[data-vote]').forEach(btn => btn.addEventListener('click', () => {
    state.votes[voter] = Number(btn.dataset.vote);
    state.currentVoter += 1;
    if (state.currentVoter >= state.totalPlayers) resolveVote();
    else showVoteCover();
  }));
}

function showVoteCover() {
  render(`
    <div class="panel handoff minimal-panel">
      <span class="player-chip">저장 완료</span>
      <div class="big-player">투표 완료</div>
      <div class="btn-row"><button id="nextVoterBtn" class="btn btn-primary" type="button">다음 플레이어</button></div>
    </div>
  `, 'vote-cover');
  document.getElementById('nextVoterBtn').addEventListener('click', showVoteHandoff);
}

function voteCounts() {
  return state.players.map((_, i) => state.votes.filter(v => v === i).length);
}

function resolveVote() {
  const counts = voteCounts();
  const maxVotes = Math.max(...counts);
  const topIndices = counts.map((count, i) => count === maxVotes ? i : -1).filter(i => i >= 0);
  const ripley = ripleyIndex();
  const caught = topIndices.length === 1 && topIndices[0] === ripley;
  state.result = {
    stage: caught ? 'caught-pending' : 'escape',
    caught,
    counts,
    maxVotes,
    topIndices,
    ripleyIndex: ripley,
    guess: '',
    correct: false
  };
  showResultReady();
}

function showResultReady() {
  render(`
    <div class="panel handoff minimal-panel">
      <span class="eyebrow">RESULT</span>
      <div class="big-player">판정 준비 완료</div>
      <p class="handoff-note">휴대폰을 중앙에 놓아주세요.</p>
      <div class="btn-row"><button id="revealResultBtn" class="btn btn-primary" type="button">결과 발표</button></div>
    </div>
  `, 'result-ready');
  document.getElementById('revealResultBtn').addEventListener('click', playModeOneResultReveal);
}

function playDrumBeat(strong = false) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = playDrumBeat.ctx || (playDrumBeat.ctx = new AudioCtx());
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(strong ? 92 : 78, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(42, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(strong ? 0.34 : 0.22, ctx.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {}
}

function playOutcomeCue(type) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = playDrumBeat.ctx || (playDrumBeat.ctx = new AudioCtx());
    if (ctx.state === 'suspended') ctx.resume();
    const makeTone = (freq, start, dur, gainValue, wave = 'triangle') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    };

    const now = ctx.currentTime + 0.01;
    if (type === 'caught') {
      makeTone(180, now, 0.16, 0.22, 'sawtooth');
      makeTone(240, now + 0.11, 0.18, 0.2, 'sawtooth');
      makeTone(320, now + 0.22, 0.22, 0.18, 'triangle');
      if (navigator.vibrate) navigator.vibrate([60, 40, 80, 40, 110]);
    } else if (type === 'escape') {
      makeTone(160, now, 0.28, 0.2, 'square');
      makeTone(128, now + 0.14, 0.26, 0.17, 'square');
      makeTone(96, now + 0.26, 0.3, 0.16, 'sine');
      if (navigator.vibrate) navigator.vibrate([120, 50, 140]);
    }
  } catch {}
}

function revealStage(kicker, main, sub = '') {
  render(`
    <div class="panel handoff minimal-panel suspense-panel">
      <span class="eyebrow">${esc(kicker)}</span>
      <div class="suspense-main">${esc(main)}</div>
      ${sub ? `<p class="handoff-note">${esc(sub)}</p>` : ''}
      <div class="suspense-pulse" aria-hidden="true"><i></i><i></i><i></i></div>
    </div>
  `, 'result-reveal');
}

function runCountdown(finalFn) {
  let n = 3;
  const tick = () => {
    revealStage('FINAL', String(n));
    playDrumBeat(n === 1);
    if (navigator.vibrate) navigator.vibrate(n === 1 ? 90 : 45);
    n -= 1;
    if (n > 0) setTimeout(tick, 620);
    else setTimeout(finalFn, 760);
  };
  tick();
}

function showManualReveal(kicker, main, sub, buttonLabel, onClick, tone = '') {
  render(`
    <div class="panel handoff minimal-panel suspense-panel ${esc(tone)}">
      <span class="eyebrow">${esc(kicker)}</span>
      <div class="suspense-main">${esc(main)}</div>
      ${sub ? `<p class="handoff-note">${esc(sub)}</p>` : ''}
      <div class="btn-row"><button id="manualRevealBtn" class="btn btn-primary" type="button">${esc(buttonLabel)}</button></div>
    </div>
  `, 'manual-reveal');
  if (tone === 'tone-caught') playOutcomeCue('caught');
  if (tone === 'tone-escape') playOutcomeCue('escape');
  document.getElementById('manualRevealBtn').addEventListener('click', onClick);
}

function playModeOneResultReveal() {
  const r = state.result;
  const topLabel = r.topIndices.map(i => ordinal(i)).join(' · ');
  showManualReveal(
    'TOP VOTE',
    r.topIndices.length === 1 ? topLabel : '동률',
    r.topIndices.length === 1 ? `${r.maxVotes}표` : `${topLabel} · ${r.maxVotes}표`,
    '판정 확인',
    () => runCountdown(() => {
      if (r.caught) {
        showManualReveal('JUDGMENT', '검거 성공', `${ordinal(r.ripleyIndex)} 리플리 적발`, '마지막 기회', showRipleyGuessHandoff, 'tone-caught');
      } else if (r.topIndices.length === 1) {
        showManualReveal('JUDGMENT', '검거 실패', `${ordinal(r.topIndices[0])} 지목`, '최종 결과 보기', showResult, 'tone-escape');
      } else {
        showManualReveal('JUDGMENT', '검거 실패', '동률 · 리플리 생존', '최종 결과 보기', showResult, 'tone-escape');
      }
    })
  );
}

function showRipleyGuessHandoff() {
  const r = state.result;
  render(`
    <div class="panel handoff minimal-panel">
      <span class="eyebrow">LAST CHANCE</span>
      <div class="big-player">${esc(ordinal(r.ripleyIndex))}</div>
      <p class="handoff-note">리플리에게 휴대폰을 넘겨주세요.</p>
      <div class="btn-row"><button id="openGuessBtn" class="btn btn-primary" type="button">단어 맞히기</button></div>
    </div>
  `, 'guess-handoff');
  document.getElementById('openGuessBtn').addEventListener('click', showRipleyGuess);
}

function showRipleyGuess() {
  if (!state.guessCandidates.length) {
    state.guessCandidates = guessCandidatesForPair(state.pairIndex);
  }
  const buttons = state.guessCandidates.map((word, i) => `
    <button class="guess-option" type="button" data-guess-index="${i}" aria-pressed="false">${esc(word)}</button>
  `).join('');

  render(`
    <div class="panel handoff minimal-panel guess-panel">
      <span class="eyebrow">LAST CHANCE · 1 / 20</span>
      <div class="big-player guess-title">시민의 단어는?</div>
      <div class="guess-grid" role="group" aria-label="시민 단어 후보 20개">${buttons}</div>
      <div class="guess-lock-row">
        <div id="guessSelected" class="guess-selected">하나를 선택하세요.</div>
        <button id="lockGuessBtn" class="btn btn-primary" type="button" disabled>최종 선택</button>
      </div>
    </div>
  `, 'word-guess');

  let selected = '';
  const lockBtn = document.getElementById('lockGuessBtn');
  const selectedEl = document.getElementById('guessSelected');
  document.querySelectorAll('[data-guess-index]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-guess-index]').forEach(other => {
        other.classList.remove('is-selected');
        other.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-selected');
      btn.setAttribute('aria-pressed', 'true');
      selected = state.guessCandidates[Number(btn.dataset.guessIndex)];
      selectedEl.textContent = selected;
      lockBtn.disabled = false;
    });
  });

  lockBtn.addEventListener('click', () => {
    if (!selected) return;
    state.wordGuess = selected;
    state.result.guess = selected;
    state.result.correct = normalizeWord(selected) === normalizeWord(state.citizenWord);
    state.result.stage = 'guess-complete';
    showManualReveal('LOCKED', selected, '선택을 잠갔습니다.', '정답 공개', () => {
      runCountdown(() => {
        showManualReveal(
          state.result.correct ? 'CORRECT' : 'WRONG',
          state.citizenWord,
          state.result.correct ? '리플리 역전 성공' : `리플리 선택 · ${selected}`,
          '최종 결과 보기',
          showResult
        );
      });
    });
  });
}

function showResult() {
  const r = state.result;
  const escaped = !r.caught;
  const ripleyWin = escaped || r.correct;
  const penaltyIndices = ripleyWin ? citizenIndices() : [r.ripleyIndex];
  const penaltyLabels = penaltyIndices.map(i => ordinal(i));
  const counts = r.counts;

  const detailRows = counts.map((count, i) => `
    <div class="detail-row ${penaltyIndices.includes(i) ? 'is-penalty' : 'is-safe'}">
      <span>${esc(state.players[i])}</span><small>${roleName(i)}</small><b>${count}표</b>
    </div>`).join('');

  render(`
    <div class="panel result result-compact result-ultra-compact">
      <div class="result-topline"><span class="result-kicker">${ripleyWin ? 'RIPLEY WINS' : 'CITIZENS WIN'}</span></div>
      <h1>${ripleyWin ? '리플리 승리' : '시민 승리'}</h1>
      <div class="penalty-hero">
        <span class="penalty-kicker">🚨 벌칙 ${penaltyLabels.length}명</span>
        <div class="penalty-names">${penaltyLabels.map(esc).join('<span>·</span>')}</div>
      </div>
      <div class="word-reveal-inline">
        <div><span>시민</span><b>${esc(state.citizenWord)}</b></div>
        <i>↔</i>
        <div class="citizen-word"><span>리플리</span><b>${esc(state.ripleyWord)}</b></div>
      </div>
      <div class="micro-rule"><b>리플리 · ${esc(ordinal(r.ripleyIndex))}</b>${r.caught ? (r.correct ? ' · 단어 역전 성공' : ' · 단어 추리 실패') : ' · 검거 회피'}</div>
      <details class="result-details">
        <summary>득표 상세</summary>
        <div class="detail-list">${detailRows}</div>
      </details>
      <div class="result-actions">
        <button id="againBtn" class="btn btn-primary" type="button">한 판 더</button>
        <button id="setupAgainBtn" class="btn" type="button">인원</button>
        <button id="menuBtn" class="btn btn-ghost slim-btn" type="button">게임 선택</button>
      </div>
    </div>
  `, 'result');

  document.getElementById('againBtn').addEventListener('click', () => { prepareRound(); showHandoff(); });
  document.getElementById('setupAgainBtn').addEventListener('click', showSetup);
  document.getElementById('menuBtn').addEventListener('click', showMenu);
}

function getUsedLifePrompts() {
  try {
    const parsed = JSON.parse(localStorage.getItem('ripley-life-used-prompts') || '[]');
    return Array.isArray(parsed) ? parsed.filter(Number.isInteger) : [];
  } catch {
    return [];
  }
}

function chooseLifePromptIndex() {
  let used = getUsedLifePrompts();
  if (used.length >= LIFE_PROMPTS.length) used = [];
  const usedSet = new Set(used);
  const available = LIFE_PROMPTS.map((_, i) => i).filter(i => !usedSet.has(i));
  const picked = available[Math.floor(Math.random() * available.length)];
  used.push(picked);
  try {
    localStorage.setItem('ripley-life-used-prompts', JSON.stringify(used));
  } catch {}
  return picked;
}

function prepareLifeRound() {
  lifeState.players = makePlayers(lifeState.totalPlayers);
  lifeState.promptIndex = chooseLifePromptIndex();
  lifeState.prompt = LIFE_PROMPTS[lifeState.promptIndex];
  lifeState.roles = shuffle([
    'ripley',
    ...Array(lifeState.totalPlayers - 1).fill('citizen')
  ]);
  lifeState.revealIndex = 0;
  lifeState.speakerIndex = 0;
  lifeState.votes = [];
  lifeState.currentVoter = 0;
  lifeState.result = null;
}

function lifeRipleyIndex() {
  return lifeState.roles.indexOf('ripley');
}

function showLifeIntro() {
  render(`
    <div class="panel compact-panel intro-panel minimal-panel">
      <span class="eyebrow">리플리 – 인생 조작단</span>
      <h1 class="page-title">승리 조건</h1>

      <div class="win-condition-grid simple-win-grid">
        <div class="win-card ripley-win-card">
          <span class="win-role">리플리</span>
          <b>끝까지 들키지 않으면 승리</b>
        </div>
        <div class="win-card citizen-win-card">
          <span class="win-role">시민</span>
          <b>리플리를 최다 지목하면 승리</b>
        </div>
      </div>

      <div class="flow-strip flow-strip-4" aria-label="게임 진행 순서">
        <span class="flow-step"><b>1</b><em>제시어</em></span>
        <span class="flow-step"><b>2</b><em>역할</em></span>
        <span class="flow-step"><b>3</b><em>진술·압박</em></span>
        <span class="flow-step"><b>4</b><em>투표</em></span>
      </div>

      <div class="btn-row action-row">
        <button id="lifeSetupBtn" class="btn btn-primary" type="button">게임 설정</button>
      </div>
    </div>
  `, 'life-intro');
  document.getElementById('lifeSetupBtn').addEventListener('click', showLifeSetup);
}

function showLifeSetup() {
  const citizens = Math.max(3, lifeState.totalPlayers - 1);
  render(`
    <div class="panel minimal-panel">
      <span class="eyebrow">GAME SETUP</span>
      <h1 class="page-title">인원 설정</h1>

      <div class="role-config">
        <label class="count-control">
          <span class="count-label">총 인원</span>
          <input id="lifeTotalPlayers" class="number-input" type="number" min="4" max="12" inputmode="numeric" value="${lifeState.totalPlayers}" />
        </label>
        <div class="count-control ripley-box">
          <span class="count-label">리플리</span>
          <div class="number-input" style="display:grid;place-items:center">1</div>
        </div>
        <div class="count-control citizen-box">
          <span class="count-label">시민</span>
          <div id="lifeCitizenCount" class="number-input" style="display:grid;place-items:center">${citizens}</div>
        </div>
      </div>

      <div id="lifeSetupError" class="setup-error hidden"></div>
      <div class="btn-row">
        <button id="lifeStartBtn" class="btn btn-primary" type="button">게임 시작</button>
      </div>
    </div>
  `, 'life-setup');

  const totalEl = document.getElementById('lifeTotalPlayers');
  const citizenEl = document.getElementById('lifeCitizenCount');
  const errorEl = document.getElementById('lifeSetupError');
  const startBtn = document.getElementById('lifeStartBtn');

  function refresh() {
    const total = Number(totalEl.value);
    const error = !Number.isInteger(total) || total < 4 || total > 12 ? '총 인원은 4명부터 12명까지 가능합니다.' : '';
    citizenEl.textContent = Number.isInteger(total) ? Math.max(0, total - 1) : '-';
    startBtn.disabled = Boolean(error);
    errorEl.classList.toggle('hidden', !error);
    errorEl.textContent = error;
  }

  totalEl.addEventListener('input', refresh);
  refresh();

  startBtn.addEventListener('click', () => {
    const total = Number(totalEl.value);
    if (!Number.isInteger(total) || total < 4 || total > 12) {
      toast('총 인원은 4명부터 12명까지 가능합니다.');
      return;
    }
    lifeState.totalPlayers = total;
    prepareLifeRound();
    showLifePrompt();
  });
}

function showLifePrompt() {
  render(`
    <div class="panel word-stage minimal-panel">
      <div class="word-label">공통 제시어</div>
      <div class="secret-word">${esc(lifeState.prompt)}</div>
      <div class="btn-row">
        <button id="lifeRoleStartBtn" class="btn btn-primary" type="button">역할 확인</button>
      </div>
    </div>
  `, 'life-prompt');
  document.getElementById('lifeRoleStartBtn').addEventListener('click', () => {
    lifeState.revealIndex = 0;
    showLifeRoleHandoff();
  });
}

function showLifeRoleHandoff() {
  const i = lifeState.revealIndex;
  render(`
    <div class="panel handoff minimal-panel">
      <span class="player-chip">역할 ${i + 1} / ${lifeState.totalPlayers}</span>
      <div class="big-player">${esc(lifeState.players[i])}</div>
      <p class="handoff-note">휴대폰을 넘겨주세요.</p>
      <div class="btn-row">
        <button id="lifeRevealRoleBtn" class="btn btn-primary" type="button">역할 확인</button>
      </div>
    </div>
  `, 'life-role-handoff');
  document.getElementById('lifeRevealRoleBtn').addEventListener('click', showLifeRole);
}

function showLifeRole() {
  const i = lifeState.revealIndex;
  const isRipley = lifeState.roles[i] === 'ripley';
  render(`
    <div class="panel word-stage minimal-panel">
      <div class="word-label">${esc(lifeState.prompt)}</div>
      <div class="secret-word">${isRipley ? '리플리' : '시민'}</div>
      <p class="micro-copy">${isRipley ? '경험도 정치도 조작하세요.' : '경험은 진실. 정치는 자유.'}</p>
      <div class="timer-track"><div class="timer-bar"></div></div>
      <div class="btn-row">
        <button id="lifeRoleSeenBtn" class="btn btn-primary" type="button">확인</button>
      </div>
    </div>
  `, 'life-role');

  let closed = false;
  const finish = () => {
    if (closed) return;
    closed = true;
    lifeState.revealIndex += 1;
    if (lifeState.revealIndex >= lifeState.totalPlayers) showLifeReady();
    else showLifeRoleHandoff();
  };
  document.getElementById('lifeRoleSeenBtn').addEventListener('click', finish);
  state.secretTimer = setTimeout(finish, 6000);
}

function showLifeReady() {
  render(`
    <div class="panel handoff minimal-panel">
      <span class="player-chip">${esc(lifeState.prompt)}</span>
      <div class="big-player">인생 진술</div>
      <p class="handoff-note">첫 번째 플레이어부터 시작하세요.</p>
      <div class="btn-row">
        <button id="lifeTalkBtn" class="btn btn-primary" type="button">진술 시작</button>
      </div>
    </div>
  `, 'life-ready');
  document.getElementById('lifeTalkBtn').addEventListener('click', () => {
    lifeState.speakerIndex = 0;
    showLifeSpeaker();
  });
}

function showLifeSpeaker() {
  const i = lifeState.speakerIndex;
  const pct = ((i + 1) / lifeState.totalPlayers) * 100;
  render(`
    <div class="panel minimal-panel">
      <div class="progress-wrap">
        <div class="progress-meta"><span>${esc(lifeState.prompt)}</span><span>${i + 1} / ${lifeState.totalPlayers}</span></div>
        <div class="progress"><div style="width:${pct}%"></div></div>
      </div>
      <div class="speaker-box speaker-box-minimal">
        <div class="speaker-name">${esc(lifeState.players[i])}</div>
        <div class="speaker-help">진술하세요.</div>
      </div>
      <div class="btn-row">
        <button id="lifeSpeechDoneBtn" class="btn btn-primary" type="button">다음</button>
      </div>
    </div>
  `, 'life-speaker');

  document.getElementById('lifeSpeechDoneBtn').addEventListener('click', () => {
    if (lifeState.speakerIndex + 1 >= lifeState.totalPlayers) showLifeDebate();
    else {
      lifeState.speakerIndex += 1;
      showLifeSpeaker();
    }
  });
}

function showLifeDebate() {
  render(`
    <div class="panel handoff minimal-panel">
      <span class="player-chip">${esc(lifeState.prompt)}</span>
      <div class="big-player">압박 시간</div>
      <p class="handoff-note">각자 한 명에게 질문 1회.</p>
      <div class="micro-rule rule-pill"><b>후보 공개 지목 · 실제 투표는 달라도 됨</b></div>
      <div class="btn-row">
        <button id="lifeVoteStartBtn" class="btn btn-primary" type="button">비밀 투표</button>
      </div>
    </div>
  `, 'life-debate');
  document.getElementById('lifeVoteStartBtn').addEventListener('click', () => {
    lifeState.currentVoter = 0;
    lifeState.votes = [];
    showLifeVoteHandoff();
  });
}

function showLifeVoteHandoff() {
  const i = lifeState.currentVoter;
  render(`
    <div class="panel handoff minimal-panel">
      <span class="player-chip">투표 ${i + 1} / ${lifeState.totalPlayers}</span>
      <div class="big-player">${esc(lifeState.players[i])}</div>
      <p class="handoff-note">휴대폰을 넘겨주세요.</p>
      <div class="vote-status">${Array.from({length: lifeState.totalPlayers}, (_, d) => `<span class="vote-dot ${d < i ? 'done' : ''}"></span>`).join('')}</div>
      <div class="btn-row">
        <button id="lifeVoteOpenBtn" class="btn btn-primary" type="button">투표하기</button>
      </div>
    </div>
  `, 'life-vote-handoff');
  document.getElementById('lifeVoteOpenBtn').addEventListener('click', showLifeVoteChoices);
}

function showLifeVoteChoices() {
  const voter = lifeState.currentVoter;
  render(`
    <div class="panel vote-private minimal-panel vote-choice-panel">
      <span class="player-chip">투표 ${voter + 1} / ${lifeState.totalPlayers}</span>
      <h1 class="page-title vote-title">누가 리플리인가요?</h1>
      <div class="vote-grid dynamic-vote-grid">
        ${lifeState.players.map((p, i) => i === voter ? '' : `<button class="person-btn" data-life-vote="${i}" type="button">${esc(p)}</button>`).join('')}
      </div>
    </div>
  `, 'life-vote-choice');

  document.querySelectorAll('[data-life-vote]').forEach(btn => btn.addEventListener('click', () => {
    lifeState.votes[voter] = Number(btn.dataset.lifeVote);
    lifeState.currentVoter += 1;
    if (lifeState.currentVoter >= lifeState.totalPlayers) resolveLifeVote();
    else showLifeVoteCover();
  }));
}

function showLifeVoteCover() {
  render(`
    <div class="panel handoff minimal-panel">
      <span class="player-chip">저장 완료</span>
      <div class="big-player">투표 완료</div>
      <div class="btn-row">
        <button id="lifeNextVoterBtn" class="btn btn-primary" type="button">다음 플레이어</button>
      </div>
    </div>
  `, 'life-vote-cover');
  document.getElementById('lifeNextVoterBtn').addEventListener('click', showLifeVoteHandoff);
}

function lifeVoteCounts() {
  return lifeState.players.map((_, i) => lifeState.votes.filter(v => v === i).length);
}

function resolveLifeVote() {
  const counts = lifeVoteCounts();
  const ripleyIndex = lifeRipleyIndex();
  const maxVotes = Math.max(...counts);
  const topIndices = counts.map((count, i) => count === maxVotes ? i : -1).filter(i => i >= 0);
  const citizenWin = topIndices.length === 1 && topIndices[0] === ripleyIndex;
  const topCitizenIndices = topIndices.filter(i => lifeState.roles[i] === 'citizen');

  lifeState.result = {
    citizenWin,
    counts,
    ripleyIndex,
    topCitizenIndices
  };
  showLifeResultReady();
}

function showLifeResultReady() {
  render(`
    <div class="panel handoff minimal-panel">
      <span class="eyebrow">RESULT</span>
      <div class="big-player">결과 준비 완료</div>
      <p class="handoff-note">휴대폰을 중앙에 놓아주세요.</p>
      <div class="btn-row">
        <button id="lifeRevealResultBtn" class="btn btn-primary" type="button">결과 발표</button>
      </div>
    </div>
  `, 'life-result-ready');
  document.getElementById('lifeRevealResultBtn').addEventListener('click', playLifeResultReveal);
}

function playLifeResultReveal() {
  const r = lifeState.result;
  const maxVotes = Math.max(...r.counts);
  const top = r.counts.map((c, i) => c === maxVotes ? i : -1).filter(i => i >= 0);
  const label = top.length === 1
    ? `${ordinal(top[0])}`
    : top.map(i => ordinal(i)).join(' · ');

  showManualReveal('TOP VOTE', '최다 득표', label, '판정 확인', () => {
    runCountdown(() => {
      if (top.length === 1) {
        const exposedIsRipley = lifeState.roles[top[0]] === 'ripley';
        const tone = exposedIsRipley ? 'tone-caught' : 'tone-escape';
        if (exposedIsRipley) {
          showManualReveal('JUDGMENT', '검거 성공', `${ordinal(top[0])} 적발`, '최종 결과 보기', showLifeResult, tone);
        } else {
          showManualReveal('JUDGMENT', '검거 실패', `${ordinal(top[0])} 지목`, '최종 결과 보기', showLifeResult, tone);
        }
      } else {
        const includesRipley = top.includes(r.ripleyIndex);
        showManualReveal(
          'JUDGMENT',
          '검거 실패',
          includesRipley ? '동률 · 리플리 생존' : '시민끼리 최다 득표',
          '최종 결과 보기',
          showLifeResult,
          'tone-escape'
        );
      }
    });
  });
}

function showLifeResult() {
  const r = lifeState.result;
  const citizenIndices = lifeState.roles.map((role, i) => role === 'citizen' ? i : -1).filter(i => i >= 0);
  const topCitizenSet = new Set(r.topCitizenIndices);

  let penaltyHtml = '';
  if (r.citizenWin) {
    penaltyHtml = `<div class="penalty-hero"><span class="penalty-kicker">🚨 벌칙 1명</span><div class="penalty-names">${esc(ordinal(r.ripleyIndex))} · 1잔</div></div>`;
  } else {
    const double = citizenIndices.filter(i => topCitizenSet.has(i));
    const single = citizenIndices.filter(i => !topCitizenSet.has(i));
    const parts = [];
    if (double.length) parts.push(`2잔 · ${double.map(i => esc(ordinal(i))).join(' · ')}`);
    if (single.length) parts.push(`1잔 · ${single.map(i => esc(ordinal(i))).join(' · ')}`);
    penaltyHtml = `<div class="penalty-hero"><span class="penalty-kicker">🚨 시민 전원 벌칙</span><div class="penalty-names">${parts.join('<br>')}</div></div>`;
  }

  const detailRows = r.counts.map((count, i) => {
    const role = lifeState.roles[i] === 'ripley' ? '리플리' : '시민';
    return `<div class="detail-row"><span>${esc(lifeState.players[i])}</span><small>${role}</small><b>${count}표</b></div>`;
  }).join('');

  render(`
    <div class="panel result result-compact result-ultra-compact">
      <div class="result-topline"><span class="result-kicker">VOTE RESULT</span></div>
      <h1>${r.citizenWin ? '시민 승리' : '리플리 승리'}</h1>
      ${penaltyHtml}

      <div class="word-reveal-inline">
        <div><span>제시어</span><b>${esc(lifeState.prompt)}</b></div>
        <i>·</i>
        <div class="citizen-word"><span>리플리</span><b>${esc(ordinal(r.ripleyIndex))}</b></div>
      </div>

      <details class="result-details">
        <summary>득표 상세</summary>
        <div class="detail-list">${detailRows}</div>
      </details>

      <div class="result-actions">
        <button id="lifeAgainBtn" class="btn btn-primary" type="button">한 판 더</button>
        <button id="lifeSetupAgainBtn" class="btn" type="button">인원</button>
        <button id="lifeMenuBtn" class="btn btn-ghost slim-btn" type="button">게임 선택</button>
      </div>
    </div>
  `, 'life-result');

  document.getElementById('lifeAgainBtn').addEventListener('click', () => {
    prepareLifeRound();
    showLifePrompt();
  });
  document.getElementById('lifeSetupAgainBtn').addEventListener('click', showLifeSetup);
  document.getElementById('lifeMenuBtn').addEventListener('click', showMenu);
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else {
        toast('이 브라우저는 전체 화면 버튼을 지원하지 않습니다.');
      }
    } else if (document.exitFullscreen) {
      await document.exitFullscreen();
    }
  } catch {
    toast('브라우저 설정 때문에 전체 화면을 열 수 없습니다.');
  }
}

fullscreenBtn.addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', () => {
  const label = fullscreenBtn.querySelector('.top-label');
  const icon = fullscreenBtn.querySelector('.top-icon');
  if (label) label.textContent = document.fullscreenElement ? '나가기' : '전체화면';
  if (icon) icon.textContent = document.fullscreenElement ? '↙' : '⛶';
  fullscreenBtn.setAttribute('aria-label', document.fullscreenElement ? '전체 화면 나가기' : '전체 화면');
});
homeBtn.addEventListener('click', () => {
  showModal('게임을 종료할까요?', '현재 진행 중인 판의 정보는 사라지고 처음 화면으로 돌아갑니다.', [
    {label:'계속하기', className:'btn-ghost'},
    {label:'처음 화면으로', className:'btn-danger', onClick:showMenu}
  ]);
});
modal.addEventListener('click', e => {
  if (e.target === modal) hideModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) hideModal();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.phase === 'reveal-word') {
    toast('단어 화면이 열려 있었습니다. 다른 사람에게 보이지 않게 주의하세요.');
  }
});


showMenu();
