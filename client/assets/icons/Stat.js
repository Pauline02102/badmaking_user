import React from 'react';
import Svg, { Path, Rect, Line, G } from 'react-native-svg';

const Calendars = (props) => (
  <Svg height="25" width="25" viewBox="0 0 32 32" {...props}>
    <G>
      <G id="Statistic">
        <Line
          fill="none"
          stroke="#1D1D1B"
          strokeMiterlimit="10"
          x1="2.9"
          x2="29.1"
          y1="26.6"
          y2="26.6"
        />
        <Rect
          fill="#1D1D1B"  // Remplissage en couleur
          height="12.6"
          stroke="#1D1D1B"
          strokeMiterlimit="10"
          width="3.8"
          x="6.8"
          y="14"
        />
        <Rect
          fill="#1D1D1B"  // Remplissage en couleur
          height="16.2"
          stroke="#1D1D1B"
          strokeMiterlimit="10"
          width="3.8"
          x="14.1"
          y="10.4"
        />
        <Rect
          fill="#1D1D1B"  // Remplissage en couleur
          height="19.9"
          stroke="#1D1D1B"
          strokeMiterlimit="10"
          width="3.8"
          x="21.4"
          y="6.7"
        />
      </G>
    </G>
  </Svg>
);

export default Calendars;
