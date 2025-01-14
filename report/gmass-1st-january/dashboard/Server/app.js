import mongoose from "mongoose";
import express from "express";
import cors from "cors";

const app = express();
const port = 3000;
app.use(cors());

mongoose.connect(
  "mongodb+srv://priyam356:Tomar9999@cluster0.cawjk02.mongodb.net/Camp",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const EmailSchema = new mongoose.Schema({
  subject: String,
  uploadId: Number,
  emails: Array,
  date: Date,
  unsubscribe: Array,
  last_sent: String,
  thread_data: Array,
  FollowUp: Number,
  stage1: String,
  stage2: String,
  stage3: String,
});
const ReportSchema = new mongoose.Schema({
  uploadId: Number,
  Opens: [String],
  Clicks: [String],
});

const ReportModel = mongoose.model("Report", ReportSchema, "Report");

const EmailModel = mongoose.model("Email", EmailSchema, "Maildata");

const getFormattedDate = (date) => {
  const startDate = new Date(date);
  return `${startDate.getDate()}-${startDate.toLocaleString("default", {
    month: "short",
  })}-${startDate.getFullYear()}`;
};

const getFormattedEndDate = (date) => {
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 28);
  return `${endDate.toLocaleString("default", {
    day: "numeric",
  })}-${endDate.toLocaleString("default", {
    month: "short",
  })}-${endDate.getFullYear()}`;
};

const getFollowUp = (stages) => {
  let stagesFalse = 0;
  if (stages.stage1 === "false") stagesFalse++;
  if (stages.stage2 === "false") stagesFalse++;
  if (stages.stage3 === "false") stagesFalse++;
  return 3 - stagesFalse;
};

const getLastSent = (last_sent) => {
  if (!last_sent) return "N/A";
  const date = new Date(last_sent);
  return date
    .toLocaleString("default", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .replace(/\//g, "-");
};

app.get("/fetch-data", async (req, res) => {
  try {
    const emails = await EmailModel.find();
    const reports = await ReportModel.find();
    const formattedData = emails.map((email, index) => {
      const report = reports.find(
        (report) => report.uploadId === email.uploadId
      );
      const Opens = report ? report.Opens.length : 0;
      const Clicks = report ? report.Clicks.length : 0;
      const lastSent = getLastSent(email.last_sent);
      const followUp = getFollowUp(email);
      return {
        subject: email.subject,
        startDate: getFormattedDate(email.date),
        endDate: getFormattedEndDate(email.date),
        totalRecipients: email.emails.length,
        noOfEmailsSent: email.emails.length || 0,
        Opens: Opens || 0,
        Clicks: Clicks || 0,
        unsubscribed: email.unsubscribe.length,
        lastSent: lastSent || "null",
        followUp: followUp || 0,
      };
    });
    res.json(formattedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(`Error fetching data: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
