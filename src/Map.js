import React, { useContext, useState } from 'react';
import update from 'immutability-helper';

import MapIcon from './MapIcon';
import BannerNotification from './BannerNotification';
import Popup, { PopupSetupMain, PopupPaused } from './Popup';
import { InfoContext } from './InfoContext';
import { useWindowDimensions } from './Utility';
import { useWidthDetector } from './useWidthDetector';
import { resetLastTickTime } from './tick';
import mapImage512 from './img/bg-512.jpg';
import mapImage1024 from './img/bg-1024.jpg';
import mapImage2048 from './img/bg-2048.jpg';


export function calculateScrollbarWidth(element) {
  if (element != null) {
    return element.offsetWidth - element.clientWidth;
  }
  return 0;
}

const Map = React.forwardRef((props, ref) => {
  const context = useContext(InfoContext);

  function toggleRunning() {
    let newRunning = !context.running;
    let popupStack = [];
    if (!newRunning) {
      popupStack.push(<PopupPaused />);
    }
    resetLastTickTime();
    context.setState((previousState) => update(previousState, {
      popupStack: {$set: popupStack},
      running: {$set: newRunning}
    }));
  }

  function toggleNotifications() {
    let newValue = !context.userInfo.settings.audio.enabled;
    context.setState((previousState) => update(previousState, {
      userInfo: {
        settings: {
          audio: {
            enabled: {$set: newValue}
          }
        }
      }
    }));
  }

  function showSetupMain() {
    let newStack = [<PopupSetupMain />];
    context.setState((previousState) => update(previousState, {
      popupStack: {$set: newStack}
    }));
  }

  const {height, width} = useWindowDimensions();
  const [state, setState] = useState();

  let bodyElement = document.body;
  let infoTabElement = document.getElementById("infotab");
  let styles;
  let popupElement = null;

  if (width > 600) {
    bodyElement.classList.add("desktop");
    bodyElement.classList.remove("mobile");
    let scrollWidth = calculateScrollbarWidth(infoTabElement);
    if (infoTabElement != null) {
      infoTabElement.style.width = 220 + scrollWidth + "px";
    }
    let dimension = Math.min(height, width - 220 - scrollWidth);
    styles = {
      height: dimension + "px",
      width: dimension + "px",
    }
    popupElement = <Popup width={dimension} height={dimension} />;
  }
  else {
    bodyElement.classList.add("mobile");
    bodyElement.classList.remove("desktop");
    styles = {
      maxHeight: null,
      maxWidth: "100%",
    }
  }

  // TODO: Fix max height
  const useAccomodateScrollbar = () => {
    if (ref.current == null) {
      return;
    }
    if (width <= 600) {
      ref.current.style.width = null;
      return;
    }
    let scrollWidth = calculateScrollbarWidth(ref.current);
    ref.current.style.width = 220 + scrollWidth + "px";
    let dimension = Math.min(height, width - 220 - scrollWidth);
    let backgroundElement = document.getElementById("bg");
    let overlayElement = document.getElementById("overlay");
    if (backgroundElement == null || overlayElement == null) {
      return;
    }
    backgroundElement.style.width = dimension + "px";
    backgroundElement.style.height = dimension + "px";
    overlayElement.style.width = dimension + "px";
    overlayElement.style.height = dimension + "px";
  }

  useWidthDetector(ref, () => {
    useAccomodateScrollbar();
  });

  let toggleButton;
  if (!context.running) {
    toggleButton = <button onClick={toggleRunning} className="button toggle green">Start</button>;
  }
  else {
    toggleButton = <button onClick={toggleRunning} className="button toggle blue">Pause</button>;
  }
  
  return (
    <div id="mapscreen" className="col">
      <div id="map">
        <img
          id="bg"
          src={mapImage512}
          srcSet={mapImage512 + " 512w," + mapImage1024 + " 1024w," + mapImage2048 + " 2048w"}
          draggable="false"
          alt="Satellite view map of San Andreas (GTA V)"
          style={styles}
        />
        <MapIcon business="bunker" />
        <MapIcon business="coke" />
        <MapIcon business="meth" />
        <MapIcon business="cash" />
        <MapIcon business="weed" />
        <MapIcon business="forgery" />
        <MapIcon business="nightclub" />
        <MapIcon business="importExport" />
        <MapIcon business="wheel" />
      </div>
      <BannerNotification />
      <div id="options" className="fsz">
				{toggleButton}
				<button onClick={toggleNotifications} className={"button audio red" + (!context.userInfo.settings.audio.enabled ? " off" : "")}>Sound</button>
				<button onClick={showSetupMain} className="button setup red">Setup</button>
			</div>
      {popupElement}
    </div>
  );
});

export default Map;
