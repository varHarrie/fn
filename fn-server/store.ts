import { Md5 } from "https://deno.land/std@0.125.0/hash/md5.ts";
import {
  Persiston,
  FileAdapter,
} from "https://deno.land/x/persiston@v0.1.0/mod.ts";
import config from "./config.ts";
import { Scheduler, User } from "./models.ts";
import { resolvePath } from "./utils/fs.ts";

class Store extends Persiston {
  users = this.collection<User>("users");
  schedulers = this.collection<Scheduler>("scheduler");
}

const adapter = new FileAdapter(resolvePath(config.storeFile));

export default new Store({
  adapter,
  getInitialData: () => {
    return {
      users: [
        {
          username: "admin",
          password: new Md5().update("123456" + config.passwordSalt).toString(),
        },
      ],
      schedulers: [],
    };
  },
});
