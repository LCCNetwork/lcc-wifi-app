import React, { Component } from 'react'
import {
    AppRegistry,
    StyleSheet,
    Text,
    View
} from 'react-native'

import App from './src/App.js'

export default class LCCWiFiApp extends Component {
    render () {
        return (
            <App></App>
        )
    }
}

AppRegistry.registerComponent('LCCWiFiApp', () => LCCWiFiApp)
