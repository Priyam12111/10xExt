import React from "react";
import { useParams } from "react-router-dom";
const Navbar = () => {
  const { name } = useParams();
  return (
    <nav className="navbar navbar-expand-lg gmasNav">
      <div className="container-fluid">
        <a className="navbar-brand navLogo" href="#">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <span className="navbar-toggler-icon d-md-none d-lg-block" />
          <img
            src="/assets/images/gmass-mailer-logo.svg"
            alt="gmass mailer"
            width={160}
            height={40}
          />
        </a>
        <div
          className="collapse navbar-collapse gmaendnav"
          id="navbarSupportedContent"
        >
          <div className="navRightSec" role="search">
            <a href="" className="mailContent">
              {(name && name.replace(":", "").toLowerCase()) ||
                "Johndoe@gmail.com"}
            </a>
            <div className="divider">&nbsp;</div>
            <a href="">
              <img
                src="/assets/images/header/help-outline.svg"
                alt=""
                width={24}
                height={24}
              />
            </a>
            <a href="">
              <img
                src="/assets/images/header/settings.svg"
                alt=""
                width={24}
                height={24}
              />
            </a>
            <a href="">
              <img
                src="/assets/images/header/Apps.svg"
                alt=""
                width={24}
                height={24}
              />
            </a>
            <div className="profileSec">
              <a href="">
                <img
                  src="/assets/images/header/profile.png"
                  alt=""
                  width={40}
                  height={40}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
