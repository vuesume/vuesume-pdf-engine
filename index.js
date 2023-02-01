const puppeteer = require("puppeteer");
const express = require("express");
const app = express();
const fs = require("fs");

// manual CORS enabling
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const removeFile = async path => {
  fs.unlink(path, err => {
    if (err) {
      console.log(err);
    } else {
      console.log("File deleted");
    }
  });
};

async function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const createPDF = async uid => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto("https://vuesume.github.io/#/preview/" + uid, {waitUntil: 'networkidle0'});

    await page.waitForSelector("#readyForPdf");
    await timeout(3000);

    await page.emulateMediaType("screen");

    const pdf = await page.pdf({
      path: "./pdfs/vuesume.pdf",
      format: "A4",
      printBackground: true
    });

    await browser.close();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

app.get("/:id", async (req, res) => {
  try {
    const pdf = await createPDF(req.params.id);
    res.download("./pdfs/vuesume.pdf", err => {
      if (err) {
        //handle error
        return;
      } else {
        //do something
        removeFile("./pdfs/vuesume.pdf");
        console.log("sent file");
      }
    });
  } catch (err) {
    console.log(err);
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log("server started successfully")
);
