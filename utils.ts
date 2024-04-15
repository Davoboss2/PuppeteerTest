export async function waitUntil(condition: boolean, duration: number) {
    return await new Promise(resolve => {
      const interval = setInterval(() => {
        console.log("Interval Ran");
        console.log(condition);
        
        if (condition) {
        clearInterval(interval);
        resolve(condition);
        };
      }, duration);
    });
  }

 export async function filter<T>(arr: T[], callback: (item: T) => Promise<boolean | undefined>) {
    const fail = Symbol()
    return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail) as T[]
  }