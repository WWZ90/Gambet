import { Link } from "react-router-dom";
import "./NotFound.css"

export const NotFound = () => {
  return (
    <div>
      <div id="notfound">
        <div class="notfound">
          <div class="notfound-404">
            <h1>
              4<span>0</span>4
            </h1>
          </div>
          <p>
            The page you are looking for might have been removed had its name
            changed or is temporarily unavailable.
          </p>
          <Link to="/">Home</Link>
          <Link to="/browsemarkets">Browse Markets</Link>
        </div>
      </div>
    </div>
  );
};
