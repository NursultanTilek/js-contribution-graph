const getData = async () => {
  try {
    const request = await fetch('https://dpg.gg/test/calendar.json');
    return await request.json();
  } catch {
    throw new Error('data is not found ');
  }
};
export { getData };
