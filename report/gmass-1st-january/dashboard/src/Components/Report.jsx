import React, { useEffect, useState } from "react";
import axios from "axios";

import { useParams } from "react-router-dom";
const Report = () => {
  useEffect(() => {
    document.title = "Massmailer Report";
  }, []);
  const { id } = useParams();
  const [nameParam, setNameParam] = useState(id.replace(":", "") || "");
  const [data, setData] = useState([]);
  let bounced;
  let clicks;
  let opens;
  let endDate;
  let followUp;
  let lastSent;
  let noOfEmailsSent;
  let startDate;
  let subject;
  let totalRecipients;
  let unsubscribed;
  let replies;
  if (data.length !== 0) {
    bounced = data[0].Bounced || 0;
    clicks = data[0].Clicks || 0;
    opens = data[0].Opens || 0;
    endDate = data[0].endDate || "";
    followUp = data[0].followUp || 0;
    lastSent = data[0].lastSent || "";
    noOfEmailsSent = data[0].noOfEmailsSent || 0;
    replies = data[0].replies || 0;
    startDate = data[0].startDate || "";
    subject = data[0].subject || "";
    totalRecipients = data[0].totalRecipients || 0;
    unsubscribed = data[0].unsubscribed || 0;
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("https://acaderealty.com/fetch-doc?uploadId=" + nameParam);
        const response = await axios.get(
          "https://acaderealty.com/fetch-doc?uploadId=" + nameParam
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <section className="bgWhiteSec">
        <div className="container-fluid">
          <div className="headingDash">
            <h3>
              <span className="textPurple">Campaign Report:</span> {subject}
            </h3>
          </div>
          <div className="linediverder">
            <hr />
          </div>
          <div className="row mt-4 align-items-start rowFlexSec">
            <div className="col-md-12 col-lg-12 col-xl-8">
              <div className="chartSec">
                <div className="headFlexSec">
                  <h5>Main Campaign Report</h5>
                  <div className="headiconSec">
                    <span>
                      <img
                        src="/assets/images/campaign-report/download-icon.svg"
                        alt=""
                        width={30}
                        height={30}
                      />
                    </span>
                    <div className="dropdown selSec">
                      <a
                        className="dropdown-toggle"
                        href="#"
                        role="button"
                        id="reportDroup"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {" "}
                      </a>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby="reportDroup"
                      >
                        <li>
                          <a className="dropdown-item" href="#">
                            Downloads as Comma-Separated Values (.csv)
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Download as Microsoft Excel (.xlsx)
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item border-0" href="#">
                            Export to Google Sheets
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="barChartSec">
                  <div className="allchartsCss">
                    <div id="main-campaign-report-one" />
                    <div className="chartHeadingRi">
                      <h6>Opens</h6>
                      <h1 className="orangeText">{opens}</h1>
                    </div>
                  </div>
                  <div className="allchartsCss">
                    <div id="main-campaign-report-two" />
                    <div className="chartHeadingRi">
                      <h6>Clicks</h6>
                      <h1 className="greenText">{clicks}</h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-12 col-lg-12 col-xl-4 setGridSec">
              <div className="numShowSec">
                <div className="headFlexSec">
                  <h5>Total Recipients</h5>
                  <div className="headiconSec">
                    <span>
                      <a href="">
                        <img
                          src="/assets/images/campaign-report/download-bg.svg"
                          alt=""
                          width={30}
                          height={30}
                        />
                      </a>
                    </span>
                    &nbsp;
                    <div className="dropdown selSec">
                      <a
                        className="dropdown-toggle"
                        href="#"
                        role="button"
                        id="dropdownMenuLink"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      />
                      <ul
                        className="dropdown-menu"
                        aria-labelledby="dropdownMenuLink"
                      >
                        <li>
                          <a className="dropdown-item" href="#">
                            Downloads as Comma-Separated Values (.csv)
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Download as Microsoft Excel (.xlsx)
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item border-0" href="#">
                            Export to Google Sheets
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <h1>{totalRecipients}</h1>
              </div>
              <div className="numShowSec">
                <div className="headFlexSec">
                  <h5>No of Email Send</h5>
                  <div className="headiconSec">
                    <span>
                      <a href="">
                        <img
                          src="/assets/images/campaign-report/download-bg.svg"
                          alt=""
                          width={30}
                          height={30}
                        />
                      </a>
                    </span>
                    <div className="dropdown selSec">
                      <a
                        className="dropdown-toggle"
                        href="#"
                        role="button"
                        id="emailDroup"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      ></a>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby="emailDroup"
                      >
                        <li>
                          <a className="dropdown-item" href="#">
                            Downloads as Comma-Separated Values (.csv)
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Download as Microsoft Excel (.xlsx)
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item border-0" href="#">
                            Export to Google Sheets
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <h1>{(data[0] && data[0].noOfEmailsSent) || 0}</h1>
              </div>
              <div className="numShowSec">
                <div className="headFlexSec">
                  <h5>Replies</h5>
                  <div className="headiconSec">
                    <span>
                      <a href="">
                        <img
                          src="/assets/images/campaign-report/download-bg.svg"
                          alt=""
                          width={30}
                          height={30}
                        />
                      </a>
                    </span>
                    <div className="dropdown selSec">
                      <a
                        className="dropdown-toggle"
                        href="#"
                        role="button"
                        id="repliesDroup"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {" "}
                      </a>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby="repliesDroup"
                      >
                        <li>
                          <a className="dropdown-item" href="#">
                            Downloads as Comma-Separated Values (.csv)
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Download as Microsoft Excel (.xlsx)
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item border-0" href="#">
                            Export to Google Sheets
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <a
                  data-bs-toggle="offcanvas"
                  data-bs-target="#repliPopSec"
                  aria-controls="repliPopSec"
                >
                  <h1>
                    {replies}{" "}
                    <span className="textsmallPurple">
                      (
                      {totalRecipients
                        ? ((replies / totalRecipients) * 100).toFixed(2)
                        : 0}
                      %)
                    </span>
                  </h1>
                </a>
              </div>
              <div className="numShowSec">
                <div className="headFlexSec">
                  <h5>Open Rate</h5>
                  <div className="headiconSec">
                    <span>
                      <a href="">
                        <img
                          src="/assets/images/campaign-report/download-bg.svg"
                          alt=""
                          width={30}
                          height={30}
                        />
                      </a>
                    </span>
                    <div className="dropdown selSec">
                      <a
                        className="dropdown-toggle"
                        href="#"
                        role="button"
                        id="openDroup"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {" "}
                      </a>
                      <ul className="dropdown-menu" aria-labelledby="openDroup">
                        <li>
                          <a className="dropdown-item" href="#">
                            Downloads as Comma-Separated Values (.csv)
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Download as Microsoft Excel (.xlsx)
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item border-0" href="#">
                            Export to Google Sheets
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <a
                  data-bs-toggle="offcanvas"
                  data-bs-target="#openPopSec"
                  aria-controls="openPopSec"
                >
                  <h1>
                    {opens}{" "}
                    <span className="textsmallPurple">
                      ({((opens / totalRecipients) * 100).toFixed(2) || 0}%)
                    </span>
                  </h1>
                </a>
              </div>
              <div className="numShowSec">
                <div className="headFlexSec">
                  <h5>Click Rate</h5>
                  <div className="headiconSec">
                    <span>
                      <a href="">
                        <img
                          src="/assets/images/campaign-report/download-bg.svg"
                          alt=""
                          width={30}
                          height={30}
                        />
                      </a>
                    </span>
                    <div className="dropdown selSec">
                      <a
                        className="dropdown-toggle"
                        href="#"
                        role="button"
                        id="repliesDroup"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {" "}
                      </a>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby="repliesDroup"
                      >
                        <li>
                          <a className="dropdown-item" href="#">
                            Downloads as Comma-Separated Values (.csv)
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Download as Microsoft Excel (.xlsx)
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item border-0" href="#">
                            Export to Google Sheets
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <a
                  data-bs-toggle="offcanvas"
                  data-bs-target="#clickRatePopSec"
                  aria-controls="clickRatePopSec"
                >
                  <h1>
                    {clicks}{" "}
                    <span className="textsmallPurple">
                      ({((clicks / totalRecipients) * 100).toFixed(2) || 0}% )
                    </span>
                  </h1>
                </a>
              </div>
              <div className="numShowSec">
                <div className="headFlexSec">
                  <h5>Unsubscribed</h5>
                  <div className="headiconSec">
                    <span>
                      <a href="">
                        <img
                          src="/assets/images/campaign-report/download-bg.svg"
                          alt=""
                          width={30}
                          height={30}
                        />
                      </a>
                    </span>
                    &nbsp;
                    <div className="dropdown selSec">
                      <a
                        className="dropdown-toggle"
                        href="#"
                        role="button"
                        id="unsubscrdrop"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      />
                      <ul
                        className="dropdown-menu"
                        aria-labelledby="unsubscrdrop"
                      >
                        <li>
                          <a className="dropdown-item" href="#">
                            Downloads as Comma-Separated Values (.csv)
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            Download as Microsoft Excel (.xlsx)
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item border-0" href="#">
                            Export to Google Sheets
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <a
                  data-bs-toggle="offcanvas"
                  data-bs-target="#unsubscribePopSec"
                  aria-controls="unsubscribePopSec"
                >
                  <h1>{unsubscribed}</h1>
                </a>
              </div>
            </div>
          </div>
          <div className="setGridSec mt-4 setmobWith">
            <div className="numShowSec">
              <div className="headFlexSec">
                <h5>Bounces</h5>
                <div className="headiconSec">
                  <span>
                    <a href="">
                      <img
                        src="/assets/images/campaign-report/download-bg.svg"
                        alt=""
                        width={30}
                        height={30}
                      />
                    </a>
                  </span>
                  <div className="dropdown selSec">
                    <a
                      className="dropdown-toggle"
                      href="#"
                      role="button"
                      id="bouncesDrp"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    ></a>
                    <ul className="dropdown-menu" aria-labelledby="bouncesDrp">
                      <li>
                        <a className="dropdown-item" href="#">
                          Downloads as Comma-Separated Values (.csv)
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#">
                          Download as Microsoft Excel (.xlsx)
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item border-0" href="#">
                          Export to Google Sheets
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <a
                data-bs-toggle="offcanvas"
                data-bs-target="#bouncesPopSec"
                aria-controls="bouncesPopSec"
              >
                <h1>{bounced}</h1>
              </a>
            </div>
          </div>
          <div className="btnview mb-0">
            <a href="">
              VIEW ALL &nbsp;
              <span>
                <i className="mdi mdi-arrow-right" />
              </span>
            </a>
          </div>
        </div>
      </section>
      {/* Start Second Sec  */}
      <section className="bgWhiteSec mt-4">
        <div className="container-fluid">
          <div className="row">
            <nav className="tabNavSec">
              <div className="nav nav-tabs" id="nav-tab" role="tablist">
                <button
                  className="nav-link active"
                  id="gmass-nav-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#nav-home1"
                  type="button"
                  role="tab"
                  aria-controls="nav-home1"
                  aria-selected="true"
                >
                  Opens
                </button>
                <button
                  className="nav-link"
                  id="gmass-nav-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#nav-home2"
                  type="button"
                  role="tab"
                  aria-controls="nav-home2"
                  aria-selected="false"
                >
                  Clicks
                </button>
                <button
                  className="nav-link"
                  id="gmass-nav-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#nav-home3"
                  type="button"
                  role="tab"
                  aria-controls="nav-home3"
                  aria-selected="false"
                >
                  Unsubscribed
                </button>
              </div>
            </nav>
            <div className="linediverder">
              <hr />
            </div>
            <div className="tab-content" id="nav-tabContent">
              <div
                className="tab-pane fade show active"
                id="nav-home1"
                role="tabpanel"
                aria-labelledby="gmass-nav-tab"
                tabIndex={0}
              >
                {/* start Current campaign table  */}
                <div
                  className="table-responsive table-container"
                  id="table-container"
                >
                  <table className="table basic-border-table mb-0 table-hover">
                    <thead>
                      <tr>
                        <th className="w30px dragablefalse" draggable="true">
                          <input className="form-check-input" type="checkbox" />{" "}
                        </th>
                        <th>Email Address</th>
                        <th>Sender</th>
                        <th>Opened</th>
                        <th>Sent</th>
                        <th>IP Address</th>
                        <th>User Agent</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td draggable="false">
                          <input className="form-check-input" type="checkbox" />
                        </td>
                        <td>ashish@brinkads.com</td>
                        <td>shubham@talk2lead.com</td>
                        <td>27 minutes ago</td>
                        <td>4 days ago</td>
                        <td>104.28.37.203</td>
                        <td>Mozilla/5.0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* End Current campaign table  */}
                <div className="btnview mb-0">
                  <a href="">
                    VIEW ALL &nbsp;
                    <span>
                      <i className="mdi mdi-arrow-right" />
                    </span>
                  </a>
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="nav-home2"
                role="tabpanel"
                aria-labelledby="gmass-nav-tab"
                tabIndex={0}
              >
                {/* start Current campaign table  */}
                <div
                  className="table-responsive table-container"
                  id="table-container"
                >
                  <table className="table basic-border-table mb-0 table-hover">
                    <thead>
                      <tr>
                        <th className="w30px dragablefalse" draggable="true">
                          <input className="form-check-input" type="checkbox" />{" "}
                        </th>
                        <th>Email Address</th>
                        <th>Sender</th>
                        <th>Clicked</th>
                        <th>Sent</th>
                        <th>URL</th>
                        <th>IP Address</th>
                        <th>User Agent</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
                {/* End Current campaign table  */}
                <div className="btnview mb-0">
                  <a href="">
                    VIEW ALL &nbsp;
                    <span>
                      <i className="mdi mdi-arrow-right" />
                    </span>
                  </a>
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="nav-home3"
                role="tabpanel"
                aria-labelledby="gmass-nav-tab"
                tabIndex={0}
              >
                {/* start Current campaign table  */}
                <div
                  className="table-responsive table-container"
                  id="table-container"
                >
                  <table className="table basic-border-table mb-0 table-hover">
                    <thead>
                      <tr>
                        <th className="w30px dragablefalse" draggable="true">
                          <input className="form-check-input" type="checkbox" />{" "}
                        </th>
                        <th>Email Address</th>
                        <th>Sender</th>
                        <th>Date</th>
                        <th>URL</th>
                        <th>IP Address</th>
                        <th>User Agent</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
                {/* End Current campaign table  */}
                <div className="btnview mb-0">
                  <a href="">
                    VIEW ALL &nbsp;
                    <span>
                      <i className="mdi mdi-arrow-right" />
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End Second Sec  */}
      {/* Start Edit History  */}
      <section className="bgWhiteSec">
        <div className="container-fluid">
          <div className="row">
            <div className="tabHeadTop">
              <h4>Edit History</h4>
            </div>
            <div className="linediverder">
              <hr />
            </div>
            {/* start Current campaign table  */}
            <div
              className="table-responsive table-container"
              id="table-container"
            >
              <table className="table basic-border-table mb-0 table-hover">
                <thead>
                  <tr>
                    <th className="w30px dragablefalse" draggable="true">
                      <input className="form-check-input" type="checkbox" />{" "}
                    </th>
                    <th>Time Range</th>
                    <th>Recipients</th>
                    <th>Opens</th>
                    <th>Clicks</th>
                    <th>Replies</th>
                    <th>Unsubscribed</th>
                    <th>Bounces</th>
                    <th>Beats</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td draggable="false">
                      <input className="form-check-input" type="checkbox" />
                    </td>
                    <td>Beginning to 12/18/2024 7:00:47 PM</td>
                    <td>0</td>
                    <td>O (NaN%)</td>
                    <td>O (NaN%)</td>
                    <td>O (NaN%)</td>
                    <td>O (NaN%)</td>
                    <td>O (NaN%)</td>
                    <td>O (NaN%)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* End Current campaign table  */}
            <div className="btnview mb-0">
              <a href="">
                VIEW ALL &nbsp;
                <span>
                  <i className="mdi mdi-arrow-right" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* End Edit History  */}
      {/* Start Other Urls Reports  */}
      <section className="bgWhiteSec">
        <div className="container-fluid">
          <div className="row">
            <div className="tabHeadTop">
              <h4>Other URL Reports</h4>
            </div>
            <div className="linediverder">
              <hr />
            </div>
            {/* start Current campaign table  */}
            <div
              className="table-responsive table-container"
              id="table-container"
            >
              <table className="table basic-border-table mb-0 table-hover">
                <thead>
                  <tr>
                    <th className="w30px dragablefalse" draggable="true">
                      <input className="form-check-input" type="checkbox" />{" "}
                    </th>
                    <th>URL</th>
                    <th className="text-center">Clicks</th>
                    <th className="text-center">Download</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td draggable="false">
                      <input className="form-check-input" type="checkbox" />
                    </td>
                    <td>
                      <a href="" className="textRed">
                        https://www.instagram.com/talk2lead_/
                      </a>
                    </td>
                    <td className="text-center">01</td>
                    <td className="text-center">
                      <div className="btnFlextd">
                        <button className="downlBtntd">
                          Download{" "}
                          <span>
                            <img
                              src="/assets/images/campaign-report/download-icon.svg"
                              alt=""
                            />
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* End Current campaign table  */}
            <div className="btnview mb-0">
              <a href="">
                VIEW ALL &nbsp;
                <span>
                  <i className="mdi mdi-arrow-right" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* End Other Urls Reports  */}
      {/* Start Replies Popup  */}
      <div
        className="offcanvas offcanvas-end filterSecPopup repPopup resizable_div"
        id="repliPopSec"
        aria-labelledby="repliPopu"
      >
        <div>
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="repliPopu">
              Replies
              <span className="btndragclose">
                <button className="downlBtntd">
                  Download{" "}
                  <span>
                    <img
                      src="/assets/images/campaign-report/download-icon.svg"
                      alt=""
                    />
                  </span>
                </button>
                <button
                  type="button"
                  className="btnclose"
                  data-bs-dismiss="offcanvas"
                  aria-label="Close"
                >
                  <i className="mdi mdi-close" />
                </button>
              </span>
            </h5>
          </div>
          <div className="offcanvas-body pt-0">
            {/* start Current campaign table  */}
            <div
              className="table-responsive table-container"
              id="table-container"
            >
              <table className="table basic-border-table mb-0 table-hover">
                <thead>
                  <tr>
                    <th className="w30px dragablefalse" draggable="true">
                      <input className="form-check-input" type="checkbox" />{" "}
                    </th>
                    <th>Email Address</th>
                    <th>Reply</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
            {/* End Current campaign table  */}
          </div>
        </div>
        <div className="resizer1" />
      </div>
      {/* End Replies Popup  */}
      {/* Start Opens Popup  */}
      <div
        className="offcanvas offcanvas-end filterSecPopup repPopup resizable_div"
        id="openPopSec"
        aria-labelledby="openPopu"
      >
        <div>
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="openPopu">
              Opens
              <span className="btndragclose">
                <button className="downlBtntd">
                  Download{" "}
                  <span>
                    <img
                      src="/assets/images/campaign-report/download-icon.svg"
                      alt=""
                    />
                  </span>
                </button>
                <button
                  type="button"
                  className="btnclose"
                  data-bs-dismiss="offcanvas"
                  aria-label="Close"
                >
                  <i className="mdi mdi-close" />
                </button>
              </span>
            </h5>
          </div>
          <div className="offcanvas-body pt-0">
            {/* start Current campaign table  */}
            <div
              className="table-responsive table-container"
              id="table-container"
            >
              <table className="table basic-border-table mb-0 table-hover">
                <thead>
                  <tr>
                    <th className="w30px dragablefalse" draggable="true">
                      <input className="form-check-input" type="checkbox" />{" "}
                    </th>
                    <th>Email Address</th>
                    <th>Opens</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
            {/* End Current campaign table  */}
          </div>
        </div>
        <div className="resizer1" />
      </div>
      {/* End Opens Popup  */}
      {/* Start Opens without Apple MPP Popup  */}
      <div
        className="offcanvas offcanvas-end filterSecPopup repPopup resizable_div"
        id="openApplyPopSec"
        aria-labelledby="openApplyPopu"
      >
        <div>
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="openPopu">
              Opens without Apple MPP
              <span className="btndragclose">
                <button className="downlBtntd">
                  Download{" "}
                  <span>
                    <img
                      src="/assets/images/campaign-report/download-icon.svg"
                      alt=""
                    />
                  </span>
                </button>
                <button
                  type="button"
                  className="btnclose"
                  data-bs-dismiss="offcanvas"
                  aria-label="Close"
                >
                  <i className="mdi mdi-close" />
                </button>
              </span>
            </h5>
          </div>
          <div className="offcanvas-body pt-0">
            {/* start Current campaign table  */}
            <div
              className="table-responsive table-container"
              id="table-container"
            >
              <table className="table basic-border-table mb-0 table-hover">
                <thead>
                  <tr>
                    <th className="w30px dragablefalse" draggable="true">
                      <input className="form-check-input" type="checkbox" />{" "}
                    </th>
                    <th>Email Address</th>
                    <th>Opens</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
            {/* End Current campaign table  */}
          </div>
        </div>
        <div className="resizer1" />
      </div>
      {/* End Opens without Apple MPP Popup  */}
      {/* Start Unsubscribed  Popup  */}
      <div
        className="offcanvas offcanvas-end filterSecPopup repPopup resizable_div"
        id="unsubscribePopSec"
        aria-labelledby="unsubscribePopu"
      >
        <div>
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="openPopu">
              Unsubscribed
              <span className="btndragclose">
                <button className="downlBtntd">
                  Download{" "}
                  <span>
                    <img
                      src="/assets/images/campaign-report/download-icon.svg"
                      alt=""
                    />
                  </span>
                </button>
                <button
                  type="button"
                  className="btnclose"
                  data-bs-dismiss="offcanvas"
                  aria-label="Close"
                >
                  <i className="mdi mdi-close" />
                </button>
              </span>
            </h5>
          </div>
          <div className="offcanvas-body pt-0">
            {/* start Current campaign table  */}
            <div
              className="table-responsive table-container"
              id="table-container"
            >
              <table className="table basic-border-table mb-0 table-hover">
                <thead>
                  <tr>
                    <th
                      className="w30px dragablefalse"
                      style={{ width: 0 }}
                      draggable="true"
                    >
                      <input className="form-check-input" type="checkbox" />{" "}
                    </th>
                    <th>Email Address</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
            {/* End Current campaign table  */}
          </div>
        </div>
        <div className="resizer1" />
      </div>
      {/* End Unsubscribed Popup  */}
      {/* Start Bounces Popup  */}
      <div
        className="offcanvas offcanvas-end filterSecPopup repPopup resizable_div"
        id="bouncesPopSec"
        aria-labelledby="bouncesPopu"
      >
        <div>
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="openPopu">
              Bounces
              <span className="btndragclose">
                <button className="downlBtntd">
                  Download{" "}
                  <span>
                    <img
                      src="/assets/images/campaign-report/download-icon.svg"
                      alt=""
                    />
                  </span>
                </button>
                <button
                  type="button"
                  className="btnclose"
                  data-bs-dismiss="offcanvas"
                  aria-label="Close"
                >
                  <i className="mdi mdi-close" />
                </button>
              </span>
            </h5>
          </div>
          <div className="offcanvas-body pt-0">
            {/* start Current campaign table  */}
            <div
              className="table-responsive table-container"
              id="table-container"
            >
              <table className="table basic-border-table mb-0 table-hover">
                <thead>
                  <tr>
                    <th className="w30px dragablefalse" draggable="true">
                      <input className="form-check-input" type="checkbox" />{" "}
                    </th>
                    <th>Email Address</th>
                    <th>Reasons</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
            {/* End Current campaign table  */}
          </div>
        </div>
        <div className="resizer1" />
      </div>
      {/* End Bounces Popup  */}
      {/* Start Blocks Popup  */}
      <div
        className="offcanvas offcanvas-end filterSecPopup repPopup resizable_div"
        id="blocksPopSec"
        aria-labelledby="blocksPopu"
      >
        <div>
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="openPopu">
              Blocks
              <span className="btndragclose">
                <button className="downlBtntd">
                  Download{" "}
                  <span>
                    <img
                      src="/assets/images/campaign-report/download-icon.svg"
                      alt=""
                    />
                  </span>
                </button>
                <button
                  type="button"
                  className="btnclose"
                  data-bs-dismiss="offcanvas"
                  aria-label="Close"
                >
                  <i className="mdi mdi-close" />
                </button>
              </span>
            </h5>
          </div>
          <div className="offcanvas-body pt-0">
            {/* start Current campaign table  */}
            <div
              className="table-responsive table-container"
              id="table-container"
            >
              <table className="table basic-border-table mb-0 table-hover">
                <thead>
                  <tr>
                    <th className="w30px dragablefalse" draggable="true">
                      <input className="form-check-input" type="checkbox" />{" "}
                    </th>
                    <th>Email Address</th>
                    <th>Reasons</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
          {/* End Current campaign table  */}
        </div>
        <div className="resizer1" />
      </div>
      {/* End Blocks Popup  */}
      {/* Start Auto follow up  */}
      <div
        className="offcanvas offcanvas-end filterSecPopup repPopup resizable_div"
        id="clickRatePopSec"
        aria-labelledby="clickRatePopu"
      >
        <div className="">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="openPopu">
              Click
              <span className="btndragclose">
                <button className="downlBtntd">
                  Download{" "}
                  <span>
                    <img
                      src="/assets/images/campaign-report/download-icon.svg"
                      alt=""
                    />
                  </span>
                </button>
                <button
                  type="button"
                  className="btnclose"
                  data-bs-dismiss="offcanvas"
                  aria-label="Close"
                >
                  <i className="mdi mdi-close" />
                </button>
              </span>
            </h5>
          </div>
          <div className="offcanvas-body pt-0">
            <div className="row align-items-center">
              <div className="col-md-4 autoTabChartSec">
                <h6>Count</h6>
                <div id="tabChartclicksec" />
              </div>
              <div className="col-md-8 autoTabChartSec">
                <h6>URL</h6>
                <div className="linkTbSec">
                  {" "}
                  <a href="">
                    https://www.facebook.com/people/Talk2Lead/61561088999816/
                  </a>
                </div>
                <div className="linkTbSec">
                  {" "}
                  <a href="">
                    https://www.facebook.com/people/Talk2Lead/61561088999816/
                  </a>
                </div>
                <div className="linkTbSec">
                  {" "}
                  <a href="">
                    https://www.facebook.com/people/Talk2Lead/61561088999816/
                  </a>
                </div>
                <div className="linkTbSec">
                  {" "}
                  <a href="">
                    https://www.facebook.com/people/Talk2Lead/61561088999816/
                  </a>
                </div>
                <div className="linkTbSec">
                  {" "}
                  <a href="">
                    https://www.facebook.com/people/Talk2Lead/61561088999816/
                  </a>
                </div>
                <div className="linkTbSec">
                  {" "}
                  <a href="">
                    https://www.facebook.com/people/Talk2Lead/61561088999816/
                  </a>
                </div>
              </div>
            </div>
            {/* start Current campaign table  */}
            <div
              className="table-responsive table-container"
              id="table-container"
            >
              <table className="table basic-border-table mb-0 table-hover">
                <thead>
                  <tr>
                    <th className="w30px dragablefalse" draggable="true">
                      <input className="form-check-input" type="checkbox" />{" "}
                    </th>
                    <th>Email Address</th>
                    <th>URL</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
            {/* End Current campaign table  */}
          </div>
        </div>
        <div className="resizer1" />
      </div>
    </>
  );
};

export default Report;
