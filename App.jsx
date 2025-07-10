import { StyleSheet, Text, View, Image, TextInput, Button, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';

const BASEURL = `https://api.openweathermap.org/data/2.5/weather`;
const API = '758ed6814204e525fd9a3aebfa27db8d';

type Weather = {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
};

const WeatherApp = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [weather, setweather] = useState<Weather>();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [city, setcity] = useState<string>('');
  const [loading, setloading] = useState<boolean>(false);

 
  const fetchweather = async () => {
    setloading(true);
    try {
      let url = '';

      if (city.trim() !== '') {
        // fetch using city name if entered
        url = `${BASEURL}?q=${city}&units=metric&appid=${API}`;
      } else if (location) {
        // otherwise, use GPS coordinates
        const lat = location.coords.latitude;
        const lon = location.coords.longitude;
        url = `${BASEURL}?lat=${lat}&lon=${lon}&units=metric&appid=${API}`;
      } else {
        setloading(false);
        return;
      }

      const results = await fetch(url);
      const data = await results.json();

      if (results.ok) {
        setweather(data);
        setErrorMsg(null);
      } else {
        setweather(undefined);
        setErrorMsg(data.message || 'Something went wrong');
      }
    } catch (e) {
      setErrorMsg('Failed to fetch weather');
    }
    setloading(false);
  };


  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

 
  useEffect(() => {
    if (location && city === '') {
      fetchweather();
    }
  }, [location]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter city name"
        value={city}
        onChangeText={setcity}
      />
      <Button title="Search" onPress={fetchweather} />

      {loading && <ActivityIndicator size="large" color="#0077b6" style={{ marginTop: 20 }} />}
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

      {weather && (
        <>
          <Text style={styles.location}>{weather.name}</Text>
          <Image
            style={styles.icon}
            source={{
              uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`,
            }}
          />
          <Text style={styles.temp}>{Math.round(weather.main.temp)}°C</Text>
          <Text style={styles.desc}>{weather.weather[0].description}</Text>
          <Text style={styles.info}>Feels Like: {Math.round(weather.main.feels_like)}°C</Text>
          <Text style={styles.info}>
            Min: {Math.round(weather.main.temp_min)}°C | Max: {Math.round(weather.main.temp_max)}°C
          </Text>
          <Text style={styles.info}>Humidity: {weather.main.humidity}%</Text>
          <Text style={styles.info}>Pressure: {weather.main.pressure} hPa</Text>
        </>
      )}
    </View>
  );
};

export default WeatherApp;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#caf0f8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    height: 50,
    padding: 10,
    borderWidth: 1,
    borderColor: '#0077b6',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  location: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#03045e',
    marginTop: 20,
  },
  temp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0077b6',
  },
  desc: {
    fontSize: 20,
    fontStyle: 'italic',
    textTransform: 'capitalize',
    color: '#023e8a',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#03045e',
    marginVertical: 2,
  },
  icon: {
    width: 150,
    height: 150,
  },
  error: {
    marginTop: 10,
    color: 'red',
    fontSize: 16,
  },
});
