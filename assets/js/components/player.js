import React, { Component } from 'react';
import Slider from 'react-rangeslider';
import { connect } from 'react-redux';
import { Howl } from 'howler';
import moment from 'moment';
import 'moment-duration-format';

import 'react-rangeslider/lib/index.css';

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      feed: null,
      state: 'stopped',
      currentlyPlaying: null,
      currentEntry: null,
      currentTime: 0,
      duration: 0,
      volume: 1.0
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log('nextProps', nextProps);

    if (this.player) {
      this.player.stop();
    }

    this.setState({
      feed: null,
      state: 'stopped',
      currentlyPlaying: null,
      currentEntry: null,
      currentTime: 0,
      duration: 0,
      volume: 1.0
    }, () => { this.playEntry(); });
  }

  handleOnChange = (value) => {
    this.setState({
      volume: value
    })
  }

  playEntry = () => {
    const entry = this.props.playlist[this.props.currentlyPlaying];

    if (this.player) {
      this.player.stop().unload();
    }

    this.player = new Howl({
      src: [entry.url],
      html5: true,
      volume: this.state.volume
    });

    this.player.once('load', () => {
      console.log('duration', this.player.duration());
      this.setState({ duration: this.player.duration() });
    });

    this.player.on('play', (id) => {
      console.log('play');
      this.timer = setInterval(() => { this.setState({ currentTime: this.state.currentTime + 1 }); }, 1000);
      this.setState({ state: 'playing', currentlyPlaying: id, currentEntry: entry });
    });

    this.player.on('pause', () => {
      console.log('pause');
      window.clearTimeout(this.timer);
    });

    this.player.on('stop', () => {
      console.log('stop');
      window.clearTimeout(this.timer);
      this.setState({ currentlyPlaying: null, state: 'stopped', duration: 0, currentTime: 0 });
    });

    this.player.play();
  }

  resume = () => {
    this.player.play(this.state.currentlyPlaying);
    this.setState({ state: 'playing' });
  }

  pause = () => {
    this.player.pause();
    this.setState({ state: 'paused' });
  }

  goBack15 = () => {
    if (this.state.currentTime >= 15) {
      this.setState({ currentTime: this.state.currentTime - 15 });
      this.player.seek(this.state.currentTime - 15);
    } else {
      this.setState({ currentTime: 0 });
      this.player.seek(0);
    }
  }

  goForward15 = () => {
    if (this.state.currentTime <= this.state.duration - 15) {
      this.setState({ currentTime: this.state.currentTime + 15 });
      this.player.seek(this.state.currentTime + 15);
    } else {
      this.setState({ currentTime: this.state.duration });
      this.player.seek(this.state.duration);
    }
  }

  onSeek = (value) => {
    this.setState({ currentTime: value });
    this.player.seek(value);
  }

  onVolumeChange = (value) => {
    this.setState({ volume: value });
    this.player.volume(value);
  }

  renderControls() {
    if (this.state.state === "playing") {
      return <img src="/images/pause.svg" alt="Pause" onClick={this.pause}/>;
    } else if (this.state.state === "paused") {
      return <img src="/images/play.svg" alt="Play" onClick={this.resume}/>;
    }

    return <img src="/images/play.svg" alt="" onClick={this.playEntry}/>;
  }

  render() {
    if (!this.props.playlist || this.state.state === 'stopped') return <div>Loading...</div>;

    let { volume } = this.state;
    return (
      <div className="player-wrapper">
        <div className="player">
          <div className="player-info">
            <img src={this.props.playlist[this.props.currentlyPlaying].feed.image} alt="" className="player-info-image"/>
            <div className="player-info-text">
              <div className="track-title">{this.props.playlist[this.props.currentlyPlaying].title}</div>
              <div className="feed-name">{this.props.playlist[this.props.currentlyPlaying].feed.name}</div>
            </div>
          </div>
          <div className="player-controls">
            <div className="player-controls-buttons">
              <img src="/images/last.svg" alt=""/>
              <img src="/images/back.svg" onClick={this.goBack15} alt="Go back 15 seconds"/>
              {this.renderControls()}
              <img src="/images/forward.svg" onClick={this.goForward15} alt="Go forward 15 seconds"/>
              <img src="/images/next.svg" alt=""/>
            </div>
            <Slider
              value={this.state.currentTime}
              onChange={this.onSeek}
              min={0}
              max={this.state.duration}
              tooltip={false}
            />
            <span className="player-controls-current-time">
              {moment.duration(this.state.currentTime, "seconds").format("hh:mm:ss", { trim: false })}
            </span>
            <span className="player-controls-total-time">
              {moment.duration(this.state.duration, "seconds").format("hh:mm:ss", { trim: false })}
            </span>
          </div>
          <div className="player-volume">
            <img src="/images/audio.svg" alt=""/>
            <Slider
              value={volume}
              tooltip={false}
              onChange={this.onVolumeChange}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentlyPlaying: state.player.currentlyPlaying,
    playlist: state.player.playlist
  };
}

export default connect(mapStateToProps)(Player);