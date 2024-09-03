import {
  type Context,
  type Item,
  type TreePath,
} from "jsr:@shougo/ddu-vim@~6.1.0/types";
import { BaseSource } from "jsr:@shougo/ddu-vim@~6.1.0/source";

import { type ActionData } from "jsr:@shougo/ddu-kind-file@~0.9.0";

import type { Denops } from "jsr:@denops/core@~7.0.0";
import * as vars from "jsr:@denops/std@~7.1.0/variable";

import { SEPARATOR as pathsep } from "jsr:@std/path@~1.0.2/constants";

function convertTreePath(treePath: TreePath) {
  return typeof treePath === "string" ? treePath : treePath.join(pathsep);
}

type Params = Record<string, never>;

export class Source extends BaseSource<Params> {
  override kind = "file";

  #uiName = "";

  override async onInit(args: {
    denops: Denops;
  }): Promise<void> {
    this.#uiName = await vars.b.get(args.denops, "ddu_ui_name", "");
  }

  override gather(args: {
    denops: Denops;
    sourceParams: Params;
  }): ReadableStream<Item<ActionData>[]> {
    const uiName = this.#uiName;
    return new ReadableStream({
      async start(controller) {
        if (uiName != "") {
          const pathHistories = (await args.denops.call(
            "ddu#get_context",
            uiName,
          ) as Context).pathHistories.map(
            (path) => convertTreePath(path),
          );

          controller.enqueue(pathHistories.map((h: string) => ({
            word: h,
            action: {
              path: h,
            },
          })));
        }

        controller.close();
      },
    });
  }

  override params(): Params {
    return {};
  }
}
