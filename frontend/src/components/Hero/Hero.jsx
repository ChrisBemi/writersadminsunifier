import "./Hero.css";
import Ceo from "../../assets/icons/ceo.png";
const Hero = () => {
  return (
    <div className="hero">
      <div className="container">
        <p className="empty"></p>
        <div className="row">
          <div className="card">
            <div className="img-wrapper">
              <img src={Ceo} alt="" />
            </div>
          </div>
          <div className="card">
            <p className="medium-header">Greetings from Bemi Editors Team!</p>
            <p className="description">
              ​We all know the struggles that many college students go through
              trying to pull both the college life and working to provide for
              their college expenses. College/University education cannot be
              overemphasized, but working to get that coin, or taking a break
              (leisure) to calm your body, soul and mind, cannot be ignored.
              Bemi Editors is a group of professional writers, proofreaders and
              editors who work around the clock to ensure that all your academic
              needs are met while you search for that extra coin in your
              full-time or part-time job. Whether it is an essay, a proposal, an
              outline, an annotated bibliography, a report, a dissertation, a
              timed exam, or anything in between, my team will ensure that all
              your assignments are answered in the best way possible. And with
              our array of turnaround times, you can give us the
              instructions/prompt, go to work/sleep, and wake up with a
              polished, and plagiarism-free paper waiting for you! Please check
              out the types of assignments help below, and place your ORDER NOW!
              <br />
              Thank you.
            </p>
            <div className="details">
              <p className="card-headers">Dr. Chris Bedan</p>
              <p className="card-headers">General Manager, BEMI EDITORS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
