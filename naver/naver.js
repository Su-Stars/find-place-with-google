import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

async function test1() {
    const query = "경기도 위니펫동물병원";
    const type = "all"

    const axiosAgent = axios.create({
        withCredentials : true,
        headers : {
            "Accept" : "application/json",
            "User-Agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "timeout" : 2000
        }
    })

    axiosAgent.interceptors.request.use((config) => {
        config.headers['Cookie'] = 'sessionId=;'; // 쿠키 초기화
        config.headers['Authorization'] = ''; // 세션 토큰 초기화
        config.timeout = 2000;


        return config;

    });

    const response = await axios.get("https://map.naver.com/p/search" + query);


    console.log(response.data);


    const $ = cheerio.load(response.data);

    // const $ = await cheerio.load(response.data);

    console.log($);
}

async function test2() {
    // 새로운 브라우저 생성 
    const browser = await puppeteer.launch({ headless : true });
    // 새 페이지 생성 - 아마 탭인듯?
    const page = await browser.newPage();
    // browser.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

    const query = "경기도 위니펫동물병원";
    const type = "all"

    await page.goto("https://map.naver.com/p/search?query=경기도 위니펫동물병원", {
        waitUntil : "networkidle2"
    });

    // iframe 나타날 때 까지 기다림
    await page.waitForSelector("iframe");

    // iframe 엘리먼트 가져오기 
    const iframeEl = await page.$('iframe');

    console.log(iframeEl);


    const iframe = await iframeEl.contentFrame();

    console.log(iframe);

    const content = await iframe.evaluate(() => {
        return document.body.innerText;
    })

    console.log(content);

    await page.close();

    await browser.close();
}

async function test3 () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // 응답 감지
    page.on("response", async (response) => {
        const url = response.url();

        // 정규표현식 전용 메서드 - 테스트
        if(url.includes("allSearch")) {

            // console.log("타겟 URL 찾음");

            try {
                const jsonData = response.json();

                const resultData = jsonData["result"];
                
                if(resultData) {
                    console.log(resultData["type"]);
                    console.log(jsonData);
                }

            } catch(err) {
                // console.log("타겟 찾았는데 실패함", err);
            }
        }
    });

    await page.goto("https://map.naver.com/p/search?query=경기도 위니펫동물병원", {
        waitUntil : "networkidle2"
    });

    // 5초 정도 대기
    await page.waitForNetworkIdle({
        timeout : 5000
    });

    await page.close();

    await browser.close();
}

async function test4() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({width : 1920, height : 1080});

    await page.setRequestInterception(true);

    // 응답 감지
    page.on("request", async (request) => {
        // if (request.url().includes('allSearch')) {
        if(request.url()) {
            console.log('Intercepted request:', request.url());
        }
        request.continue(); // 요청을 계속 진행
    });

    await page.goto("https://map.naver.com/p/search?query=경기도 위니펫동물병원", {
        waitUntil : "networkidle2"
    });


    // 5초 정도 대기
    const frame = await page.waitForFrame("");


    await page.close();

    await browser.close();
}

async function test5(query) {
    const browser = await puppeteer.launch({ headless: true }); // 비헤드리스 모드 실행
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36');

  // 1. 지도 어플리케이션으로 이동 - allSearch 경로로 요청하기 위해, 페이지 내에 연결 컨텍스트 유지하기.
  await page.goto('https://map.naver.com/p', {
    waitUntil: 'networkidle2', // 네트워크 요청이 대부분 완료될 때까지 대기
  });

  const preUrl = `/p/api/search/allSearch?query=${encodeURIComponent(query)}&type=all&searchCoord=127.03396200000066%3B37.20950000000062&boundary=`

  // evaluate 는 현재 열린 페이지 내에서, 콜백 함수로 주어진 인자를 실행하겠다는 것이다.
  // 그런데, evaluate 에 함수의 인자가 들어가지 못하여, 밑에 따로 "preUrl" 을 인자로 주어 사용할 수 있게 만들었다.
  const allSearchResponse = await page.evaluate(async (url) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json(); // JSON 데이터 반환
  }, preUrl);

  console.log('AllSearch Response:', allSearchResponse);

  // 이건 꼭 닫아줘야 함.
  await browser.close();

  return allSearchResponse;
}

async function sequalTest() {
    const result1 = await test5("동탄문화센터 수영장");
    const result2 = await test5("경기도 위니펫동물병원");

    console.log(result1);
    console.log(result2);
}

sequalTest();