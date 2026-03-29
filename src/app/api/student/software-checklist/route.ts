import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const PROFESSIONAL_MODULE_SOFTWARE = [
  {
    id: "tia-portal",
    name: "TIA Portal V17 or later",
    description:
      "Siemens Totally Integrated Automation Portal for PLC programming",
    installed: false,
    verified: false,
  },
  {
    id: "wincc",
    name: "WinCC",
    description: "Siemens SCADA/HMI system for process visualization",
    installed: false,
    verified: false,
  },
  {
    id: "factory-io",
    name: "FactoryIO",
    description: "3D factory simulation for PLC testing and learning",
    installed: false,
    verified: false,
  },
  {
    id: "web-browser",
    name: "Web Browser (Chrome/Firefox)",
    description: "Latest version of Google Chrome or Mozilla Firefox",
    installed: false,
    verified: false,
  },
];

const AI_MODULE_SOFTWARE = [
  {
    id: "python",
    name: "Python 3.10+",
    description: "Python programming language version 3.10 or higher",
    installed: false,
    verified: false,
  },
  {
    id: "ide",
    name: "VS Code or PyCharm",
    description: "Code editor / IDE for Python development",
    installed: false,
    verified: false,
  },
  {
    id: "tensorflow-sklearn",
    name: "TensorFlow / scikit-learn",
    description: "Machine learning frameworks for AI development",
    installed: false,
    verified: false,
  },
  {
    id: "opencv",
    name: "OpenCV",
    description: "Computer vision library for image processing",
    installed: false,
    verified: false,
  },
  {
    id: "factory-io",
    name: "FactoryIO",
    description: "3D factory simulation for integration projects",
    installed: false,
    verified: false,
  },
  {
    id: "web-browser",
    name: "Web Browser (Chrome/Firefox)",
    description: "Latest version of Google Chrome or Mozilla Firefox",
    installed: false,
    verified: false,
  },
];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id as string;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: { softwareChecklist: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student record not found" },
        { status: 404 }
      );
    }

    // If checklist exists, return it
    if (student.softwareChecklist) {
      return NextResponse.json({
        id: student.softwareChecklist.id,
        items: student.softwareChecklist.items as any[],
        allVerified: student.softwareChecklist.allVerified,
      });
    }

    // Create default checklist based on course
    const defaultItems =
      student.course === "AI_MODULE"
        ? AI_MODULE_SOFTWARE
        : PROFESSIONAL_MODULE_SOFTWARE;

    const checklist = await prisma.softwareChecklist.create({
      data: {
        studentId: student.id,
        items: defaultItems,
      },
    });

    return NextResponse.json({
      id: checklist.id,
      items: checklist.items as any[],
      allVerified: checklist.allVerified,
    });
  } catch (error) {
    console.error("Software checklist GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id as string;

    const student = await prisma.student.findUnique({
      where: { userId },
      include: { softwareChecklist: true },
    });

    if (!student || !student.softwareChecklist) {
      return NextResponse.json(
        { error: "Checklist not found" },
        { status: 404 }
      );
    }

    const { itemId, installed } = await req.json();

    if (!itemId || typeof installed !== "boolean") {
      return NextResponse.json(
        { error: "itemId and installed (boolean) are required" },
        { status: 400 }
      );
    }

    const items = student.softwareChecklist.items as any[];
    const updatedItems = items.map((item: any) =>
      item.id === itemId ? { ...item, installed } : item
    );

    const checklist = await prisma.softwareChecklist.update({
      where: { id: student.softwareChecklist.id },
      data: { items: updatedItems },
    });

    return NextResponse.json({
      id: checklist.id,
      items: checklist.items as any[],
      allVerified: checklist.allVerified,
    });
  } catch (error) {
    console.error("Software checklist PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
