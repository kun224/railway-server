const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// ✅ SteamCharts 크롤링 API
app.get("/api/steam-charts", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://steamcharts.com/top");

    const games = await page.evaluate(() => {
      return Array.from(document.querySelectorAll(".common-table tbody tr"))
        .map((row) => {
          const rank = row.querySelector("td:nth-child(1)")?.innerText.trim();
          const name = row.querySelector("td:nth-child(2) a")?.innerText.trim();
          const url = row.querySelector("td:nth-child(2) a")?.href;
          return { rank, name, url };
        })
        .slice(0, 20);
    });

    await browser.close();
    res.json(games);
  } catch (error) {
    console.error("❌ SteamCharts 크롤링 오류:", error);
    res.status(500).json({ error: "SteamCharts 데이터를 가져오는 중 오류 발생" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
