import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { Station } from '../src/models/station';

const importStations = (filePath: string) => {
    const stations: Station[] = [];

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => {
            const station: Station = {
                id: data.id,
                name: data.name,
                location: {
                    latitude: parseFloat(data.latitude),
                    longitude: parseFloat(data.longitude),
                },
                fuelTypes: data.fuelTypes.split(','),
            };
            stations.push(station);
        })
        .on('end', () => {
            console.log('Imported stations:', stations);
            // Here you would typically save the stations to a database
        })
        .on('error', (error) => {
            console.error('Error reading the CSV file:', error);
        });
};

// Example usage: importStations(path.join(__dirname, 'stations.csv'));
export default importStations;