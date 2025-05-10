import { Picker } from '@react-native-picker/picker';
import { createClient } from '@supabase/supabase-js';
import React, { useState } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

const supabaseUrl = 'https://jwdrjpajlbzstmewijlm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3ZHJqcGFqbGJ6c3RtZXdpamxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NTQ0MzAsImV4cCI6MjA2MjAzMDQzMH0.zOcsqbfEoM1c2Fr38tGVQjqbpEwPkKWvSAqbLvgyhIA'; // Replace with environment variable in production
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const tables = [
  'admin',
  'passenger_assistance_officer',
  'commuter',
  'commuter_request',
  'bus_route',
  'bus_stop',
  'virtual_bus_stop',
];

export default function App() {
  const [selectedTable, setSelectedTable] = useState(tables[0]);
  const [data, setData] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  // CREATE
  const handleCreate = async () => {
    try {
      let payload: any = {};

      switch (selectedTable) {
        case 'admin':
          payload = {
            admin_email: `admin_${Date.now()}@example.com`,
            admin_password: 'secure123',
            admin_fname: 'John',
            admin_lname: 'Doe',
          };
          break;
        case 'passenger_assistance_officer':
          payload = {
            pao_email: `pao_${Date.now()}@example.com`,
            pao_password: 'secure123',
            pao_fname: 'Jane',
            pao_lname: 'Smith',
            created_by_admin_id: 'some-uuid-string',
          };
          break;
        case 'commuter':
          payload = {
            commuter_email: `commuter_${Date.now()}@example.com`,
            commuter_password: 'secure123',
            commuter_fname: 'Alice',
            commuter_lname: 'Jones',
            commuter_birth_date: '1990-01-01',
            commuter_type: 'regular',
            verification_status: 'pending',
            cr_id: 1,
            verified_by_admin_id: 1,
          };
          break;
        case 'commuter_request':
          payload = {
            cr_timestamp: new Date().toISOString(),
            cr_status: 'pending',
          };
          break;
        case 'bus_route':
          payload = {
            br_name: `Route ${Date.now()}`,
            br_number: `R${Math.floor(Math.random() * 1000)}`,
            br_origin: 'Station A',
            br_destination: 'Station B',
            pao_id: 1,
          };
          break;
        case 'bus_stop':
          payload = {
            bs_name: `Stop ${Date.now()}`,
            bs_lat: 10.3,
            bs_lng: 123.9,
            bs_landmark: 'Landmark',
            br_id: 1,
            commuter_id: 1,
          };
          break;
        case 'virtual_bus_stop':
          payload = {
            vbs_name: `Virtual Stop ${Date.now()}`,
            vbs_lat: 10.31,
            vbs_lng: 123.88,
            vbs_type: 'standard',
            vbs_capacity: 20,
            vbs_status: 'active',
            cr_id: 1,
            pao_id: 1,
            bs_id: 1,
          };
          break;
        default:
          setMessage('Unsupported table.');
          return;
      }

      const { error } = await supabase.from(selectedTable).insert(payload);
      if (error) throw error;

      setMessage(`Created new record in '${selectedTable}'.`);
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : JSON.stringify(err));
    }
  };

  // READ
  const handleRead = async () => {
    try {
      const { data, error } = await supabase.from(selectedTable).select('*');
      if (error) throw error;
      setData(data);
      setMessage(`Read ${data.length} records from '${selectedTable}'.`);
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : JSON.stringify(err));
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    try {
      const { data: existing, error } = await supabase
        .from(selectedTable)
        .select('*')
        .limit(1);

      if (error) throw error;
      if (!existing || existing.length === 0) {
        setMessage('No data to update.');
        return;
      }

      const idKey = Object.keys(existing[0]).find((key) =>
        key.endsWith('_id')
      );
      if (!idKey) {
  setMessage('No ID key found in the record.');
  return;
}
      const idValue = existing[0][idKey];

      let updatePayload: any = {};
      switch (selectedTable) {
        case 'admin':
          updatePayload = { admin_fname: 'UpdatedName' };
          break;
        case 'passenger_assistance_officer':
          updatePayload = { pao_fname: 'UpdatedPAO' };
          break;
        case 'commuter':
          updatePayload = { commuter_fname: 'UpdatedCommuter' };
          break;
        case 'commuter_request':
          updatePayload = { cr_status: 'updated' };
          break;
        case 'bus_route':
          updatePayload = { br_name: 'UpdatedRoute' };
          break;
        case 'bus_stop':
          updatePayload = { bs_name: 'UpdatedStop' };
          break;
        case 'virtual_bus_stop':
          updatePayload = { vbs_name: 'UpdatedVBS' };
          break;
        default:
          setMessage('Update not supported for this table.');
          return;
      }

      const { error: updateError } = await supabase
        .from(selectedTable)
        .update(updatePayload)
        .eq(idKey!, idValue);

      if (updateError) throw updateError;

      setMessage(`Updated ${selectedTable} record with ID: ${idValue}`);
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : JSON.stringify(err));
    }
  };

  // DELETE
  const handleDelete = async () => {
    try {
      const { data: existing, error } = await supabase
        .from(selectedTable)
        .select('*')
        .limit(1);

      if (error) throw error;
      if (!existing || existing.length === 0) {
        setMessage('No data to delete.');
        return;
      }

      const idKey = Object.keys(existing[0]).find((key) =>
        key.endsWith('_id')
      );
      if (!idKey) {
  setMessage('No ID key found in the record.');
  return;
}
      const idValue = existing[0][idKey];

      const { error: deleteError } = await supabase
        .from(selectedTable)
        .delete()
        .eq(idKey!, idValue);

      if (deleteError) throw deleteError;

      setMessage(`Deleted from '${selectedTable}' (ID: ${idValue})`);
    } catch (err) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : JSON.stringify(err));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <ScrollView>
        <Text>Select Table:</Text>
        <Picker
          selectedValue={selectedTable}
          onValueChange={(itemValue) => setSelectedTable(itemValue)}>
          {tables.map((table) => (
            <Picker.Item key={table} label={table} value={table} />
          ))}
        </Picker>

        <View style={{ marginVertical: 10 }}>
          <Button title="Create" onPress={handleCreate} />
          <Button title="Read" onPress={handleRead} />
          <Button title="Update" onPress={handleUpdate} />
          <Button title="Delete" onPress={handleDelete} />
        </View>

        <Text style={{ marginVertical: 10 }}>{message}</Text>
        {data.length > 0 &&
          data.map((item, idx) => (
            <Text key={idx} style={{ fontSize: 12 }}>
              {JSON.stringify(item)}
            </Text>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}
