import type { Context, Item, TreePath } from "@shougo/ddu-vim/types";
import { BaseSource } from "@shougo/ddu-vim/source";

import type { ActionData } from "@shougo/ddu-kind-file";

import type { Denops } from "@denops/std";
import * as vars from "@denops/std/variable";

import { SEPARATOR as pathsep } from "@std/path/constants";

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
