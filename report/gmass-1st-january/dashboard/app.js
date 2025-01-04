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
  status: String,
  MaxEmails: Number,
  date: Date,
  startDate: String,
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
  Emails: [String],
});

const ReportModel = mongoose.model("Report", ReportSchema, "Report");

const EmailModel = mongoose.model("Email", EmailSchema, "Maildata");

app.get("/fetch-data", async (req, res) => {
  try {
    const emails = await EmailModel.find();
    const reports = await ReportModel.find();
    const formattedData = emails.map((email, index) => {
      let Opens = 0;
      let lastSent = "N/A";
      const startDate = new Date(email.date);

      const endDate = new Date(startDate);
      reports.forEach((report) => {
        if (report.uploadId == email.uploadId) {
          Opens = JSON.stringify(report.Emails.length);
          return Opens;
        }
      });
      endDate.setDate(endDate.getDate() + 28);
      const formattedEndDate = `${endDate.toLocaleString("default", {
        day: "numeric",
      })}-${endDate.toLocaleString("default", {
        month: "short",
      })}-${endDate.getFullYear()}`;
      const formattedDate = `${
        startDate.getDate() - 1
      }-${startDate.toLocaleString("default", {
        month: "short",
      })}-${startDate.getFullYear()}`;
      lastSent = email.last_sent
        ? new Date(email.last_sent)
            .toLocaleString("default", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
            .replace(/\//g, "-")
        : "N/A";
      let stagesFalse = 0;
      if (email.stage1 == "false") stagesFalse++;
      if (email.stage2 == "false") stagesFalse++;
      if (email.stage3 == "false") stagesFalse++;
      let followUp = 3 - stagesFalse;
      return {
        subject: email.subject,
        startDate: formattedDate.split("T")[0],
        endDate: formattedEndDate,
        totalRecipients: email.emails.length,
        noOfEmailsSent: email.emails.length || 0,
        Opens: Opens || 0,
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
