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

      reports.forEach((report) => {
        if (report.uploadId == email.uploadId) {
          Opens = JSON.stringify(report.Emails.length);
          return Opens;
        }
      });
      const startDate = new Date(email.startDate || email.date);
      const endDate = new Date(startDate);
      let lastSent = new Date(email.last_sent) || "null";
      if (lastSent != "null") {
        lastSent = lastSent.toString().split("T")[0];
      }
      endDate.setDate(startDate.getDate() + 30);
      const formattedEndDate = endDate.toISOString().split("T")[0];
      return {
        subject: email.subject,
        startDate: startDate.toISOString().split("T")[0],
        endDate: formattedEndDate,
        totalRecipients: email.emails.length,
        noOfEmailsSent: email.MaxEmails || 0,
        Opens: Opens || 0,
        unsubscribed: email.unsubscribe.length,
        lastSent: lastSent || "null",
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
